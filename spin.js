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
    const googleSheetScriptURL = 'PASTE_YOUR_NEW_GOOGLE_APPS_SCRIPT_URL_HERE';

    function getEmailFromURL() {
        const params = new URLSearchParams(window.location.search);
        userEmail = params.get('email') || '';
        if (!userEmail) {
            spinButton.disabled = true;
            alert('Email not found. Please sign up from the homepage.');
        }
    }

    function buildWheel() {
        wheel.innerHTML = '';
        const sliceCount = rewards.length;
        const sliceAngle = 360 / sliceCount;
        const gradientParts = [];

        rewards.forEach((reward, i) => {
            const startAngle = sliceAngle * i;
            const endAngle = startAngle + sliceAngle;
            const sliceColor = i % 2 === 0 ? '#FFFFFF' : '#F0EAD6';
            gradientParts.push(`${sliceColor} ${startAngle}deg ${endAngle}deg`);

            // Create and position the content for each slice
            const content = document.createElement('div');
            content.className = 'slice-content';
            content.innerHTML = `
                <img src="${reward.icon}" alt="${reward.text}">
                <span>${reward.text}</span>
            `;

            const contentAngle = startAngle + sliceAngle / 2; // Midpoint angle of the slice
            const radius = wheel.offsetWidth / 3; // Position content further from the center
            
            // Convert angle to radians for Math.sin/cos
            const angleRad = (contentAngle - 90) * (Math.PI / 180);

            const x = (wheel.offsetWidth / 2) + radius * Math.cos(angleRad);
            const y = (wheel.offsetHeight / 2) + radius * Math.sin(angleRad);
            
            content.style.left = `${x}px`;
            content.style.top = `${y}px`;
            content.style.transform = `translate(-50%, -50%) rotate(${contentAngle}deg)`;

            wheel.appendChild(content);
        });

        wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
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
        
        // Calculate rotation: 5 full spins + random offset within the winning slice
        const randomOffset = Math.random() * (sliceAngle - 10) + 5; // Avoid landing exactly on the line
        const targetRotation = (360 * 5) + (360 - (winningSliceIndex * sliceAngle) - randomOffset);

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
            buildWheel();
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