document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultPopup = document.getElementById('result-popup');
    const rewardText = document.getElementById('reward-text');

    let rewards = [];
    let userEmail = '';
    let isSpinning = false;

    // --- Google Sheets Integration ---
    // 1. Create a new Google Sheet for logging rewards.
    // 2. Go to Extensions > Apps Script.
    // 3. Paste the server-side script (provided at the bottom of this file) and save.
    // 4. Click Deploy > New deployment. Select "Web app".
    // 5. For "Who has access", select "Anyone".
    // 6. Click Deploy. Authorize permissions.
    // 7. Copy the Web app URL and paste it below.
    const googleSheetScriptURL = 'https://script.google.com/macros/s/AKfycbydU2U1RDCqTJt68twVWqP4uXmQyXQ5MDxRHGYNvfp9R4_7x62IpJZ6tI1f47yzRFEc/exec';

    function getEmailFromURL() {
        const params = new URLSearchParams(window.location.search);
        userEmail = params.get('email') || '';
        if (!userEmail) {
            spinButton.disabled = true;
            alert('Email not found. Please sign up from the homepage.');
        }
    }

    function preloadImages(rewards) {
        return Promise.all(rewards.map(reward => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = reward.icon;
                img.onload = () => resolve({ ...reward, iconImg: img });
                img.onerror = reject;
            });
        }));
    }

    function buildWheel(loadedRewards) {
        const canvas = wheel;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const wheelSize = rect.width; // Use layout size for calculations
        const center = wheelSize / 2;
        const radius = center - 10;
        const sliceCount = loadedRewards.length;
        const anglePerSlice = (2 * Math.PI) / sliceCount;

        loadedRewards.forEach((reward, i) => {
            const startAngle = i * anglePerSlice;
            const endAngle = startAngle + anglePerSlice;
            
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#F0EAD6';
            ctx.fill();
            ctx.stroke();

            const midAngle = startAngle + anglePerSlice / 2;
            const textRadius = radius * 0.65;
            const x = center + textRadius * Math.cos(midAngle);
            const y = center + textRadius * Math.sin(midAngle);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(midAngle + Math.PI / 2); // Correct rotation to be perpendicular to the radius line

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = '#101820';
            ctx.font = "bold 16px Inter";
            
            const logo = reward.iconImg;
            const words = reward.text.split(' ');
            const lineHeight = 20;
            const logoYOffset = -25;
            const textYOffset = 25;
            
            ctx.drawImage(logo, -25, logoYOffset - 25, 50, 50);

            words.forEach((word, index) => {
                const yPos = textYOffset + (index * lineHeight);
                ctx.fillText(word, 0, yPos);
            });

            ctx.restore();
        });
    }

    function getWeightedRandomReward() {
        const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
        let random = Math.random() * totalChance;
        for (let i = 0; i < rewards.length; i++) {
            if (random < rewards[i].chance) {
                return i;
            }
            random -= rewards[i].chance;
        }
        return 0; // Fallback
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;

        const winningSliceIndex = getWeightedRandomReward();
        const sliceAngle = 360 / rewards.length;
        const midAngleOfWinner = (winningSliceIndex * sliceAngle) + (sliceAngle / 2);
        
        // Random offset within the slice to make it less predictable
        const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
        
        // The pointer is at 270 degrees. We want the middle of the winning slice to align with it.
        const targetRotation = (360 * 5) + 270 - midAngleOfWinner - randomOffset;

        wheel.style.transform = `rotate(${targetRotation}deg)`;

        setTimeout(() => {
            const winningReward = rewards[winningSliceIndex];
            rewardText.textContent = winningReward.text;
            resultPopup.classList.add('show');
            
            if(winningReward.text.toLowerCase() !== 'try again') {
                logRewardToSheet(userEmail, winningReward.text);
            }

        }, 5500); // Wait for animation to finish
    }

    function logRewardToSheet(email, reward) {
        if (!googleSheetScriptURL.includes('macros')) {
            console.warn('Google Sheets URL is not set. Skipping log.');
            return;
        }
        
        const dataToSubmit = { email, reward };

        fetch(googleSheetScriptURL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit)
        }).catch(error => console.error('Error logging to sheet:', error));
    }
    
    // Initial setup
    fetch('assets/rewards.json')
        .then(response => response.json())
        .then(data => {
            rewards = data.rewards;
            return preloadImages(rewards);
        })
        .then(loadedRewards => {
            // Defer wheel building to ensure correct dimensions are read
            setTimeout(() => buildWheel(loadedRewards), 0);
        });
    
    getEmailFromURL();
    spinButton.addEventListener('click', spinWheel);
});

/*
--- GOOGLE APPS SCRIPT CODE (for RewardsLog Sheet) ---
Copy this code into your new Google Apps Script project.

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RewardsLog');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('RewardsLog');
      sheet.appendRow(['Timestamp', 'Email', 'Reward Won']);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.email,
      data.reward
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

*/

const scriptURL = 'https://script.google.com/macros/s/AKfycbytGx01q1ERhEzr7GlU3Ua1aeJyvBZCNSNlEGJQhphpESTOIePeuCHH8PVkL9eHT5uuEw/exec';

document.getElementById('spinForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('spinEmail').value;
  const resultDiv = document.getElementById('spinResult');
  resultDiv.textContent = "Spinning...";
  const res = await fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify({action: 'generatePromoCode', email}),
    headers: {'Content-Type': 'application/json'}
  });
  const data = await res.json();
  if (data.error) {
    resultDiv.textContent = data.error;
  } else {
    resultDiv.innerHTML = `Your code: <b>${data.code}</b><br>Discount: <b>${data.discount}</b>`;
  }
}); 