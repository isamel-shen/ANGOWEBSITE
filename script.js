// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Fetch rewards.json to check if lead magnet should be disabled
    fetch('assets/rewards.json')
        .then(response => response.json())
        .then(data => {
            if (data.disabled) {
                const leadMagnetContainer = document.getElementById('lead-magnet-container');
                if (leadMagnetContainer) leadMagnetContainer.style.display = 'none';
            }
        });
    const animateElements = document.querySelectorAll('.service-card, .stat, .contact-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    const leadMagnetForm = document.getElementById('lead-magnet-form');
    if (leadMagnetForm) {
        leadMagnetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('lead-email');
            const email = emailInput.value;

            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Redirect to the spin page with the email as a query parameter
            window.location.href = `spin.html?email=${encodeURIComponent(email)}`;
        });
    }
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const subject = this.querySelectorAll('input[type="text"]')[1].value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stats = entry.target.querySelectorAll('.stat h3');
            stats.forEach(stat => {
                const target = parseInt(stat.textContent);
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe stats section
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
    statsObserver.observe(aboutStats);
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-graphic');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 500);
    }
});

// Add hover effects to service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add scroll to top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    border: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    font-size: 1.2rem;
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add loading spinner for form submission
function showLoadingSpinner(button) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    button.prepend(spinner);
}

// Enhanced form submission with loading spinner
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        showLoadingSpinner(submitBtn);
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// --- Modular Email Signup (Lead Magnet) ---
const leadMagnetForm = document.getElementById('lead-magnet-form');
const leadMagnetSuccess = document.getElementById('lead-magnet-success');

if (leadMagnetForm) {
    leadMagnetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('lead-email').value;
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        // TODO: Integrate with Mailchimp, Google Sheets, or other service here
        // Example: sendEmailToService(email);
        leadMagnetForm.style.display = 'none';
        if (leadMagnetSuccess) leadMagnetSuccess.style.display = 'block';
        // Redirect to the spin page with the email as a query parameter
        window.location.href = `spin.html?email=${encodeURIComponent(email)}`;
    });
}

// --- Load tournaments from JSON ---
let tournaments = [];
let killSwitch = false;
function loadTournamentsAndRender() {
    fetch('assets/tournaments.json')
        .then(res => res.json())
        .then(data => {
            // Support both old and new JSON structure
            if (Array.isArray(data)) {
                tournaments = data;
                killSwitch = false;
            } else {
                tournaments = data.tournaments || [];
                killSwitch = !!data.killSwitch;
            }
            
            // Replace video with logo if killswitch is true
            if (killSwitch) {
                const videoContainer = document.getElementById('hero-video-content');
                if (videoContainer) {
                    videoContainer.innerHTML = `
                        <img src=\"assets/logo_transparent.png\" alt=\"ANGO Logo\" style=\"width:100%;height:100%;object-fit:contain;border-radius:16px;\">\n                    `;
                    videoContainer.classList.add('killswitch-active');
                }
            }
            
            renderTournamentList();
            // Find the next upcoming event
            const now = new Date();
            let nextEvent = tournaments
                .map(ev => ({...ev, dateObj: new Date(ev.date)}))
                .filter(ev => ev.dateObj >= new Date(now.getFullYear(), now.getMonth(), 1))
                .sort((a, b) => a.dateObj - b.dateObj)[0];
            let startYear = now.getFullYear();
            let startMonth = now.getMonth();
            if (nextEvent) {
                startYear = nextEvent.dateObj.getFullYear();
                startMonth = nextEvent.dateObj.getMonth();
            }
            renderCalendar(startYear, startMonth);
            renderAllTournamentsInfo();
        });
}

// --- Render Tournament List ---
function renderTournamentList() {
    const list = document.getElementById('tournament-list');
    if (!list) return;
    if (killSwitch || tournaments.length === 0) {
        list.innerHTML = '';
        return;
    }
    list.innerHTML = tournaments.map(t => `
        <div class="tournament-card" onclick="showEventDetails(${t.id})">
            <h3>${t.name}</h3>
            <p><strong>Sport:</strong> ${t.sport}</p>
            <p><strong>Date:</strong> ${t.date} &nbsp; <strong>Time:</strong> ${t.time}</p>
            <p><strong>Location:</strong> ${t.location}</p>
            <p><strong>Format:</strong> ${t.format}</p>
            <p><strong>Entry Fee:</strong> ${t.entryFee}</p>
            <p><strong>Prize Pool:</strong> ${t.prizePool}</p>
            <button class="btn btn-primary" onclick="event.stopPropagation(); showRegistrationForm(${t.id})">Register</button>
        </div>
    `).join('');
}

// --- Show Event Details ---
window.showEventDetails = function(id) {
    const event = tournaments.find(t => t.id === id);
    const details = document.getElementById('event-details');
    if (!event || !details) return;
    details.innerHTML = `
        <div class="event-details-card">
            <h2>${event.name}</h2>
            <p><strong>Sport:</strong> ${event.sport}</p>
            <p><strong>Date:</strong> ${event.date} &nbsp; <strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Format:</strong> ${event.format}</p>
            <p><strong>Entry Fee:</strong> ${event.entryFee}</p>
            <p><strong>Prize Pool:</strong> ${event.prizePool}</p>
            <p><strong>Skill Level:</strong> ${event.skillLevel}</p>
            <p>${event.description}</p>
            <button class="btn btn-primary" onclick="showRegistrationForm(${event.id})">Register</button>
            <button class="btn btn-secondary" onclick="closeEventDetails()">Close</button>
        </div>
    `;
    details.scrollIntoView({behavior:'smooth'});
}

window.closeEventDetails = function() {
    const details = document.getElementById('event-details');
    if (details) details.innerHTML = '';
}

// --- Registration Form ---
window.showRegistrationForm = function(id) {
    const event = tournaments.find(t => t.id === id);
    const reg = document.getElementById('registration-form-container');
    if (!event || !reg) return;
    reg.innerHTML = `
        <form class="registration-form">
            <h2>Register for ${event.name}</h2>
            <input type="text" placeholder="Your Name" required><br>
            <input type="email" placeholder="Your Email" required><br>
            <input type="text" placeholder="Team Name (optional)"><br>
            <button type="submit" class="btn btn-primary">Submit Registration</button>
            <button type="button" class="btn btn-secondary" onclick="closeRegistrationForm()">Cancel</button>
        </form>
    `;
    reg.scrollIntoView({behavior:'smooth'});
    // Add submit handler
    const form = reg.querySelector('.registration-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Integrate with registration backend/service
            alert('Registration submitted!');
            reg.innerHTML = '';
        });
    }
}

window.closeRegistrationForm = function() {
    const reg = document.getElementById('registration-form-container');
    if (reg) reg.innerHTML = '';
}

// --- Calendar Rendering for Scheduling Tab ---
function renderCalendar(year, month) {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;
    const eventDetails = document.getElementById('calendar-event-details');
    if (eventDetails) eventDetails.style.display = 'none';
    // Always show the calendar grid, but hide events if killSwitch is on
    // Build calendar header
    let html = `<div class='calendar-container-modern'>`;

    // --- Limited Spots Message ---
    const limitedEvents = (!killSwitch) ? tournaments.filter(ev => {
        const evDate = new Date(ev.date);
        return ev.limited && evDate.getFullYear() === year && evDate.getMonth() === month;
    }) : [];
    if (limitedEvents.length > 0) {
        html += `<div class='limited-spots-message' style="background: #ffefc1; color: #b30000; font-weight: bold; font-size: 1.2rem; padding: 1rem 1.5rem; border-radius: 10px; margin-bottom: 1.2rem; text-align: center; box-shadow: 0 2px 8px rgba(199,161,91,0.10); animation: pulse 1.2s infinite alternate;">
            ${limitedEvents.map(ev => `Limited spots remaining for <span style='color:#b30000;'>${ev.name}</span>!`).join('<br>')}
        </div>`;
    }

    html += `<div class='calendar-nav'>
        <button class='calendar-arrow' id='prev-month'>&lt;</button>
        <span class='calendar-title'>${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
        <button class='calendar-arrow' id='next-month'>&gt;</button>
    </div>`;
    // Day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    html += `<div class='calendar-grid'>`;
    for (let d of days) html += `<div class='calendar-day-header'>${d}</div>`;

    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    // Fill initial empty cells
    for (let i = 0; i < firstDay.getDay(); i++) {
        html += `<div class='calendar-cell'></div>`;
    }

    // Fill days
    for (let date = 1; date <= lastDay.getDate(); date++) {
        const thisDate = new Date(year, month, date);
        const dateStr = thisDate.toISOString().slice(0, 10);
        const events = (!killSwitch) ? tournaments.filter(ev => ev.date === dateStr) : [];
        let cellClass = 'calendar-cell';
        let dateNumClass = 'calendar-date-num';
        if (
            thisDate.getDate() === today.getDate() &&
            thisDate.getMonth() === today.getMonth() &&
            thisDate.getFullYear() === today.getFullYear()
        ) {
            cellClass += '';
            dateNumClass += ' today';
        }
        html += `<div class='${cellClass}' data-date='${dateStr}'>`;
        html += `<div class='${dateNumClass}'>${date}</div>`;
        if (events.length > 0) {
            html += `<div class='calendar-event-stack'>`;
            for (let ev of events) {
                html += `<div class='calendar-event-box' data-event-id='${ev.id}'>
                    <strong>${ev.sport}</strong>
                    <span class='event-meta'>${ev.entryFee} ENTRY</span>
                    <span class='event-meta'>${ev.prizePool} PRIZE</span>
                </div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    // Fill trailing empty cells
    const totalCells = firstDay.getDay() + lastDay.getDate();
    for (let i = totalCells; i % 7 !== 0; i++) {
        html += `<div class='calendar-cell'></div>`;
    }
    html += `</div></div>`;
    calendarContainer.innerHTML = html;

    // Month navigation
    document.getElementById('prev-month').onclick = () => {
        let newMonth = month - 1, newYear = year;
        if (newMonth < 0) { newMonth = 11; newYear--; }
        renderCalendar(newYear, newMonth);
    };
    document.getElementById('next-month').onclick = () => {
        let newMonth = month + 1, newYear = year;
        if (newMonth > 11) { newMonth = 0; newYear++; }
        renderCalendar(newYear, newMonth);
    };

    // Event click handlers
    document.querySelectorAll('.calendar-event-box').forEach(el => {
        el.onclick = (e) => {
            e.stopPropagation();
            const eventId = parseInt(el.getAttribute('data-event-id'));
            // Instead of redirecting, show event details in the calendar-event-details div
            const event = tournaments.find(ev => ev.id === eventId);
            const detailsDiv = document.getElementById('calendar-event-details');
            if (event && detailsDiv) {
                detailsDiv.innerHTML = `
                    <div class="event-details-card" style="background:var(--offwhite);padding:2rem 2.5rem;border-radius:18px;box-shadow:0 4px 32px rgba(23,32,42,0.06);max-width:600px;margin:1.5rem auto;">
                        <h2 style="font-size:2rem;font-weight:800;color:var(--navy-dark);margin-bottom:1rem;">${event.name}</h2>
                        <p><strong>Sport:</strong> ${event.sport}</p>
                        <p><strong>Date:</strong> ${event.date} &nbsp; <strong>Time:</strong> ${event.time}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Format:</strong> ${event.format}</p>
                        <p><strong>Entry Fee:</strong> ${event.entryFee}</p>
                        <p><strong>Prize Pool:</strong> ${event.prizePool}</p>
                        <p><strong>Skill Level:</strong> ${event.skillLevel}</p>
                        <p>${event.description || ''}</p>
                        <button class="btn btn-primary" onclick="window.location.href='registration.html?event=${event.id}'">Register</button>
                        <button class="btn btn-secondary" onclick="document.getElementById('calendar-event-details').style.display='none';">Close</button>
                    </div>
                `;
                detailsDiv.style.display = 'block';
                detailsDiv.scrollIntoView({behavior:'smooth'});
            }
        };
    });
}

// --- Render All Tournament Information ---
function renderAllTournamentsInfo() {
    const infoDiv = document.getElementById('all-tournaments-info');
    if (!infoDiv) return;
    if (killSwitch || tournaments.length === 0) {
        infoDiv.innerHTML = `<div style="text-align:center;font-size:1.2rem;color:var(--navy-dark);padding:2rem 0;">We're working on something big...</div>`;
        return;
    }
    infoDiv.innerHTML = tournaments.map(t => `
        <div class="tournament-info-card" style="background:var(--offwhite);margin-bottom:2rem;padding:2rem 1.5rem;border-radius:16px;box-shadow:0 2px 12px rgba(23,32,42,0.06);max-width:600px;margin-left:auto;margin-right:auto;">
            <h2 style="font-size:1.5rem;font-weight:800;color:var(--navy-dark);margin-bottom:0.7rem;">${t.name}</h2>
            <p><strong>Sport:</strong> ${t.sport}</p>
            <p><strong>Date:</strong> ${t.date} &nbsp; <strong>Time:</strong> ${t.time}</p>
            <p><strong>Location:</strong> ${t.location}</p>
            <p><strong>Format:</strong> ${t.format}</p>
            <p><strong>Entry Fee:</strong> ${t.entryFee}</p>
            <p><strong>Prize Pool:</strong> ${t.prizePool}</p>
            <p><strong>Skill Level:</strong> ${t.skillLevel}</p>
            <p>${t.description}</p>
            <div style="text-align:center;margin-top:1.5rem;">
                <button class="btn btn-primary" onclick="window.location.href='registration.html?event=${t.id}'" style="padding:0.75rem 2rem;font-size:1rem;font-weight:600;border-radius:8px;border:none;cursor:pointer;transition:all 0.3s ease;background:var(--navy-dark);color:white;">
                    Register for ${t.name}
                </button>
            </div>
        </div>
    `).join('');
}

// --- Notification Bar Functionality ---
let notificationBar = null;
let currentMessageIndex = 0;
let rotationInterval = null;
let isHovered = false;

function initializeNotificationBar() {
    const notificationBarElement = document.getElementById('notification-bar');
    const notificationTextElement = document.getElementById('notification-text');
    
    if (!notificationBarElement || !notificationTextElement) return;
    
    // Fetch notification bar configuration from tournaments.json
    fetch('assets/tournaments.json')
        .then(response => response.json())
        .then(data => {
            if (data.notificationBar && data.notificationBar.enabled && data.notificationBar.messages && data.notificationBar.messages.length > 0) {
                notificationBar = data.notificationBar;
                
                // Set initial message
                updateNotificationText();
                
                // Start rotation
                startRotation();
                
                // Add click handler
                notificationBarElement.addEventListener('click', handleNotificationClick);
                
                // Add hover handlers
                notificationBarElement.addEventListener('mouseenter', handleNotificationHover);
                notificationBarElement.addEventListener('mouseleave', handleNotificationLeave);
            } else {
                // Hide notification bar if disabled or no messages
                notificationBarElement.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading notification bar configuration:', error);
            notificationBarElement.style.display = 'none';
        });
}

function updateNotificationText() {
    const notificationTextElement = document.getElementById('notification-text');
    if (!notificationTextElement || !notificationBar) return;
    
    const currentMessage = notificationBar.messages[currentMessageIndex];
    notificationTextElement.textContent = currentMessage.text;
}

function startRotation() {
    if (!notificationBar || notificationBar.messages.length <= 1) return;
    
    rotationInterval = setInterval(() => {
        if (!isHovered) {
            currentMessageIndex = (currentMessageIndex + 1) % notificationBar.messages.length;
            updateNotificationText();
        }
    }, notificationBar.rotationInterval || 5000);
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

function handleNotificationClick() {
    if (!notificationBar) return;
    
    const currentMessage = notificationBar.messages[currentMessageIndex];
    if (currentMessage.link) {
        if (currentMessage.link.startsWith('#')) {
            // Internal anchor link
            const target = document.querySelector(currentMessage.link);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } else {
            // External link
            window.open(currentMessage.link, '_blank', 'noopener,noreferrer');
        }
    }
}

function handleNotificationHover() {
    isHovered = true;
}

function handleNotificationLeave() {
    isHovered = false;
}

// --- Render on Load ---
(function() {
    loadTournamentsAndRender();
    initializeNotificationBar();
})(); 