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
        wheel.innerHTML = ''; // Clear previous HTML content
        const sliceCount = rewards.length;
        const sliceAngle = 360 / sliceCount;
        const wheelSize = wheel.offsetWidth;
        const center = wheelSize / 2;
        const radius = center * 0.6; // Position content at 60% of the radius

        // Create SVG element
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${wheelSize} ${wheelSize}`);

        rewards.forEach((reward, i) => {
            const angle = sliceAngle * i + sliceAngle / 2; // Midpoint angle of the slice
            const angleRad = angle * (Math.PI / 180);

            // --- Create a group for each slice's content ---
            const contentGroup = document.createElementNS(svgNS, "g");
            // Rotate the entire group around the wheel's center
            contentGroup.setAttribute("transform", `rotate(${angle}, ${center}, ${center})`);

            // --- Add the Image ---
            const image = document.createElementNS(svgNS, "image");
            image.setAttributeNS(null, "href", reward.icon);
            image.setAttribute("x", center - 30); // Center the image
            image.setAttribute("y", center - radius - 40); // Position along the radius
            image.setAttribute("width", "60");
            image.setAttribute("height", "60");

            // --- Add the Text ---
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", center);
            text.setAttribute("y", center - radius + 30); // Position below the image
            text.setAttribute("class", "wheel-text");
            text.textContent = reward.text;
            
            // --- Keep content upright on the left side of the wheel ---
            if (angle > 90 && angle < 270) {
                const textX = Number(text.getAttribute("x"));
                const textY = Number(text.getAttribute("y"));
                const imgX = Number(image.getAttribute("x")) + 30; // 30 is half width
                const imgY = Number(image.getAttribute("y")) + 30; // 30 is half height
                
                text.setAttribute("transform", `rotate(180, ${textX}, ${textY})`);
                image.setAttribute("transform", `rotate(180, ${imgX}, ${imgY})`);
            }

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