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
        wheel.innerHTML = ''; // Clear previous content
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const wheelSize = wheel.offsetWidth;
        const center = wheelSize / 2;
        svg.setAttribute("viewBox", `0 0 ${wheelSize} ${wheelSize}`);

        const sliceCount = rewards.length;
        const anglePerSlice = 360 / sliceCount;
        const radius = center * 0.65; // Position the center of our content group at 65% of the radius
        const logoSize = 50;
        const textYOffset = 15; // Vertical distance of text from the anchor point
        const logoYOffset = -35; // Vertical distance of logo from the anchor point

        rewards.forEach((reward, i) => {
            // Angle for the centerline of the slice
            const midAngle = (i * anglePerSlice) + (anglePerSlice / 2);
            
            // Convert angle to radians for positioning
            const angleRad = midAngle * (Math.PI / 180);
            const x = center + radius * Math.cos(angleRad);
            const y = center + radius * Math.sin(angleRad);

            // The <g> element is our container for a slice's content
            const contentGroup = document.createElementNS(svgNS, "g");
            // Translate the group to the anchor point, then rotate it to face outwards
            contentGroup.setAttribute("transform", `translate(${x}, ${y}) rotate(${midAngle + 90})`);

            // The logo image, centered at (0, logoYOffset) within the rotated group
            const image = document.createElementNS(svgNS, "image");
            image.setAttributeNS(null, "href", reward.icon);
            image.setAttribute("x", -logoSize / 2);
            image.setAttribute("y", logoYOffset);
            image.setAttribute("width", logoSize);
            image.setAttribute("height", logoSize);

            // The text element, centered at (0, textYOffset) within the rotated group
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("class", "wheel-text");
            text.setAttribute("y", textYOffset);

            const words = reward.text.split(' ');
            words.forEach((word, index) => {
                const tspan = document.createElementNS(svgNS, "tspan");
                tspan.textContent = word;
                tspan.setAttribute("x", 0);
                tspan.setAttribute("dy", index === 0 ? "0" : "1.2em"); // Handle line breaks
                text.appendChild(tspan);
            });

            contentGroup.appendChild(image);
            contentGroup.appendChild(text);
            svg.appendChild(contentGroup);
        });

        wheel.appendChild(svg);
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
            // Defer wheel building to ensure correct dimensions are read
            setTimeout(buildWheel, 0);
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