document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultPopup = document.getElementById('result-popup');
    const rewardText = document.getElementById('reward-text');

    let rewards = [];
    let userEmail = '';
    let isSpinning = false;
    const backendURL = 'https://script.google.com/macros/s/AKfycbzfTSIxL6bbNzkLdgBqEwI5W_8kBXO2JPIa7M7IsHaOuiYYofjDe1naWLCUN3Wojkcd2Q/exec';
    let generatedCode = '';
    let spunReward = '';

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

        const wheelSize = rect.width;
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
            ctx.rotate(midAngle + Math.PI / 2);

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
        return 0;
    }

    async function checkIfEmailUsed(email) {
        const res = await fetch(backendURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkIfEmailUsed', email })
        });
        return await res.json();
    }

    async function generatePromoCode(email, reward) {
        const res = await fetch(backendURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generatePromoCode', email, reward })
        });
        return await res.json();
    }

    async function handleSpin() {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;

        // Check if email already used
        const check = await checkIfEmailUsed(userEmail);
        if (check.used) {
            rewardText.textContent = "You've already used your spin with this email.";
            resultPopup.classList.add('show');
            isSpinning = false;
            return;
        }

        const winningSliceIndex = getWeightedRandomReward();
        const sliceAngle = 360 / rewards.length;
        const midAngleOfWinner = (winningSliceIndex * sliceAngle) + (sliceAngle / 2);
        const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
        const targetRotation = (360 * 5) + 270 - midAngleOfWinner - randomOffset;
        wheel.style.transform = `rotate(${targetRotation}deg)`;

        setTimeout(async () => {
            const winningReward = rewards[winningSliceIndex];
            spunReward = winningReward.text;
            // Call backend to generate code and log
            const backendRes = await generatePromoCode(userEmail, spunReward);
            if (backendRes.error) {
                rewardText.textContent = backendRes.error;
            } else {
                generatedCode = backendRes.code;
                rewardText.innerHTML = `You won: <strong>${spunReward}</strong><br>Your code: <strong>${generatedCode}</strong>`;
            }
            resultPopup.classList.add('show');
            isSpinning = false;
        }, 5500);
    }
    
    // Initial setup
    fetch('assets/rewards.json')
        .then(response => response.json())
        .then(data => {
            rewards = data.rewards;
            return preloadImages(rewards);
        })
        .then(loadedRewards => {
            setTimeout(() => buildWheel(loadedRewards), 0);
        });
    
    getEmailFromURL();
    spinButton.addEventListener('click', handleSpin);
}); 