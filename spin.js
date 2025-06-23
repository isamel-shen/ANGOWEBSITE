document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultPopup = document.getElementById('result-popup');
    const rewardText = document.getElementById('reward-text');

    let rewards = [];
    let userEmail = '';
    let isSpinning = false;
    const backendURL = 'https://api.cors.lol/?url=https://script.google.com/macros/s/AKfycbwqMHtUZ7Qsrj6LYMhLv2FqAdMessBe6lxPwpyTrjIO8QTyM40qtztr1lpw3ZaZNXLBzQ/exec';
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
        try {
            const res = await fetch(backendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkIfEmailUsed', email })
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (jsonErr) {
                return { error: "Non-JSON response from backend", raw: text };
            }
        } catch (error) {
            return { error: error.toString() };
        }
    }

    async function generatePromoCode(email, reward) {
        try {
            const res = await fetch(backendURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generatePromoCode', email, reward })
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (jsonErr) {
                return { error: "Non-JSON response from backend", raw: text };
            }
        } catch (error) {
            return { error: error.toString() };
        }
    }

    async function handleSpin() {
        console.log('Spin button clicked');
        if (isSpinning) {
            console.log('Already spinning, ignoring click');
            return;
        }
        
        if (!userEmail) {
            console.log('No email found');
            alert('Email not found. Please sign up from the homepage.');
            return;
        }
        
        console.log('Starting spin for email:', userEmail);
        isSpinning = true;
        spinButton.disabled = true;

        // Check if email already used
        console.log('Checking if email already used...');
        const check = await checkIfEmailUsed(userEmail);
        if (check.used) {
            console.log('Email already used');
            rewardText.textContent = "You've already used your spin with this email.";
            resultPopup.classList.add('show');
            isSpinning = false;
            return;
        }

        console.log('Email not used, proceeding with spin');
        const winningSliceIndex = getWeightedRandomReward();
        console.log('Winning slice index:', winningSliceIndex);
        
        const sliceAngle = 360 / rewards.length;
        const midAngleOfWinner = (winningSliceIndex * sliceAngle) + (sliceAngle / 2);
        const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
        const targetRotation = (360 * 5) + 270 - midAngleOfWinner - randomOffset;
        
        console.log('Spinning wheel to rotation:', targetRotation);
        wheel.style.transform = `rotate(${targetRotation}deg)`;

        setTimeout(async () => {
            console.log('Spin animation complete');
            const winningReward = rewards[winningSliceIndex];
            spunReward = winningReward.text;
            console.log('Winning reward:', spunReward);
            
            // Call backend to generate code and log
            console.log('Generating promo code...');
            const backendRes = await generatePromoCode(userEmail, spunReward);
            
            // Find the parent paragraph to update its content correctly
            const rewardParagraph = rewardText.parentElement;

            if (backendRes.error) {
                console.log('Backend error:', backendRes.error);
                rewardParagraph.innerHTML = `An error occurred: <br><strong>${backendRes.error}</strong>`;
            } else {
                generatedCode = backendRes.code;
                console.log('Generated code:', generatedCode);
                rewardParagraph.innerHTML = `You won: <strong>${spunReward}</strong><br><br>Your code is: <strong>${generatedCode}</strong>`;
            }
            resultPopup.classList.add('show');
            isSpinning = false;
        }, 5500);
    }
    
    // Initial setup
    console.log('Starting spinner initialization...');
    fetch('assets/rewards.json')
        .then(response => response.json())
        .then(data => {
            console.log('Rewards loaded:', data.rewards);
            rewards = data.rewards;
            return preloadImages(rewards);
        })
        .then(loadedRewards => {
            console.log('Images preloaded, building wheel...');
            setTimeout(() => {
                buildWheel(loadedRewards);
                console.log('Wheel built successfully');
            }, 0);
        })
        .catch(error => {
            console.error('Error loading rewards:', error);
        });
    
    getEmailFromURL();
    console.log('Adding click event listener to spin button');
    spinButton.addEventListener('click', handleSpin);
    console.log('Spinner initialization complete');
}); 