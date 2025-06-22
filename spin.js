document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const spinBtn = document.getElementById('spinBtn');
    const emailDisplay = document.getElementById('email-display');
    const congratsOverlay = document.getElementById('congrats-overlay');
    const prizeName = document.getElementById('prize-name');
    const ctx = canvas.getContext('2d');

    let prizes = [];
    let userEmail = '';
    let isSpinning = false;
    let currentAngle = 0;

    // --- Google Sheets Integration ---
    // Make sure this URL is correct and the script is deployed as a web app.
    const googleSheetScriptURL = 'https://script.google.com/macros/s/AKfycbwPz26Bv-st1R1r9P_nCEX2KuDkPb4JkM-O46NnvRflg61Gz7sWnug172qA12b32Y5H/exec';

    function getEmailFromURL() {
        const params = new URLSearchParams(window.location.search);
        userEmail = params.get('email') || '';
        if (userEmail) {
            emailDisplay.textContent = `Spinning for: ${userEmail}`;
        } else {
            spinBtn.style.display = 'none';
            emailDisplay.textContent = 'Email not found. Please go back and sign up.';
        }
    }

    function preloadImages(prizes) {
        let loaded = 0;
        return new Promise((resolve) => {
            if (prizes.every(p => !p.icon)) {
                resolve(prizes.map(p => ({ ...p, iconImg: null })));
                return;
            }
            prizes.forEach((prize, index) => {
                if (prize.icon) {
                    const img = new Image();
                    img.src = prize.icon;
                    img.onload = () => {
                        prizes[index].iconImg = img;
                        loaded++;
                        if (loaded === prizes.length) resolve(prizes);
                    };
                    img.onerror = () => { // Handle cases where an image might fail
                        prizes[index].iconImg = null;
                        loaded++;
                        if (loaded === prizes.length) resolve(prizes);
                    };
                } else {
                    prizes[index].iconImg = null;
                    loaded++;
                    if (loaded === prizes.length) resolve(prizes);
                }
            });
        });
    }

    function buildWheel(loadedPrizes) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 600 * dpr;
        canvas.height = 600 * dpr;
        ctx.scale(dpr, dpr);
        const center = 300;
        const radius = 290;
        const numPrizes = loadedPrizes.length;
        const anglePerPrize = (2 * Math.PI) / numPrizes;

        ctx.clearRect(0, 0, 600, 600);
        ctx.font = 'bold 18px Inter, sans-serif';

        loadedPrizes.forEach((prize, i) => {
            const startAngle = i * anglePerPrize + currentAngle;
            const endAngle = startAngle + anglePerPrize;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#F0EAD6';
            ctx.fill();
            ctx.stroke();

            // --- Draw content ---
            ctx.save();
            const midAngle = startAngle + anglePerPrize / 2;
            ctx.translate(center, center);
            ctx.rotate(midAngle);
            
            // Text settings
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#101820';
            
            const textRadius = radius * 0.6;
            const iconRadius = radius * 0.75;
            
            // Check if text should be flipped
            const isFlipped = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2;
            
            if (isFlipped) {
                ctx.rotate(Math.PI);
                ctx.translate(-textRadius, 0);
            } else {
                ctx.translate(textRadius, 0);
            }

            // Draw prize name (handle multi-line)
            const words = prize.name.split(' ');
            const lineHeight = 22;
            let line = '';
            let y = -((words.length -1) * lineHeight) /2; // Start y position to center text block

            words.forEach(word => {
                ctx.fillText(word, 0, y);
                y += lineHeight;
            });
            
            // Draw icon
            if (prize.iconImg) {
                const iconSize = 50;
                let iconX = -iconSize / 2;
                let iconY = -60 - (iconSize /2); // Position above text
                
                if (isFlipped) {
                    ctx.drawImage(prize.iconImg, iconX, -iconY-80, iconSize, iconSize);
                } else {
                    ctx.drawImage(prize.iconImg, iconX, iconY, iconSize, iconSize);
                }
            }
            
            ctx.restore();
        });
    }

    function getWeightedRandomPrizeIndex() {
        const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < prizes.length; i++) {
            if (random < prizes[i].probability) return i;
            random -= prizes[i].probability;
        }
        return 0; // Fallback
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.style.pointerEvents = 'none'; // Prevent re-clicks

        const actualPrizeIndex = getWeightedRandomPrizeIndex();
        const numPrizes = prizes.length;
        const anglePerPrize = (2 * Math.PI) / numPrizes;

        // Calculate where the wheel needs to stop. The pointer is at 270 degrees (top).
        const prizeStopAngle = actualPrizeIndex * anglePerPrize;
        const targetStopAngle = (3 * Math.PI) / 2; // Pointer position
        const randomOffset = (Math.random() - 0.5) * anglePerPrize * 0.8;
        
        const rotationNeeded = (targetStopAngle - prizeStopAngle - randomOffset) - currentAngle;
        const totalRotation = (10 * 2 * Math.PI) + rotationNeeded; // 10 full spins + final adjustment
        
        let startTime = null;
        const duration = 5000; // 5 seconds

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const easeOutProgress = Math.pow(progress / duration, 0.5); // Ease-out effect

            if (progress < duration) {
                const angle = currentAngle + totalRotation * (progress / duration);
                canvas.style.transform = `rotate(${angle * 180/Math.PI}deg)`;
                requestAnimationFrame(animate);
            } else {
                currentAngle = rotationNeeded; // Set final angle correctly
                canvas.style.transform = `rotate(${currentAngle * 180/Math.PI}deg)`;
                
                setTimeout(() => {
                    isSpinning = false;
                    const winningPrize = prizes[actualPrizeIndex];
                    
                    // Show congrats message
                    prizeName.textContent = winningPrize.name;
                    congratsOverlay.classList.remove('hidden');

                    // Trigger confetti
                    confetti({
                        particleCount: 150,
                        spread: 90,
                        origin: { y: 0.6 }
                    });

                    // Log to Google Sheet if not 'Try Again'
                    if (winningPrize.name.toLowerCase() !== 'try again') {
                        logRewardToSheet(userEmail, winningPrize.name);
                    }
                }, 500); // Short delay before showing modal
            }
        }
        requestAnimationFrame(animate);
    }
    
    function logRewardToSheet(email, reward) {
        if (!googleSheetScriptURL || !googleSheetScriptURL.includes('macros')) {
            console.warn('Google Sheets URL is not set. Skipping log.');
            return;
        }
        const data = { email, reward };
        
        fetch(googleSheetScriptURL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.error("Error logging to sheet:", err));
    }

    // --- Init ---
    fetch('assets/rewards.json')
        .then(res => res.json())
        .then(data => {
            return preloadImages(data.rewards);
        })
        .then(loadedPrizes => {
            prizes = loadedPrizes;
            buildWheel(prizes); // Initial wheel draw
        })
        .catch(console.error);

    getEmailFromURL();
    spinBtn.addEventListener('click', spinWheel);
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