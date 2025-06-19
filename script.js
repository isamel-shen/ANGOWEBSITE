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
    const animateElements = document.querySelectorAll('.service-card, .stat, .contact-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
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
        // TODO: Integrate with Mailchimp, Google Sheets, or other service here
        // Example: sendEmailToService(email);
        leadMagnetForm.style.display = 'none';
        leadMagnetSuccess.style.display = 'block';
    });
}

// --- Tournaments/Events Data (Easy to Update) ---
const tournaments = [
    {
        id: 1,
        name: 'Spring Showdown',
        sport: 'Basketball',
        date: '2024-05-25',
        time: '10:00 AM',
        location: 'Downtown Sports Center',
        format: 'Single Elimination',
        entryFee: '$50',
        prizePool: '$500',
        skillLevel: 'All Levels',
        merch: ['Shirt', 'Towel'],
        media: [],
        description: 'Kick off the season with our Spring Showdown!'
    },
    {
        id: 2,
        name: 'Summer Slam',
        sport: 'Soccer',
        date: '2024-07-10',
        time: '2:00 PM',
        location: 'Greenfield Park',
        format: 'Round Robin',
        entryFee: '$40',
        prizePool: '$300',
        skillLevel: 'Beginner/Intermediate',
        merch: ['Shirt'],
        media: [],
        description: 'Join our fun and friendly summer soccer tournament!'
    },
    {
        id: 3,
        name: 'Downtown Basketball Classic',
        sport: 'Basketball',
        date: '2024-06-27',
        time: '5:00 PM',
        location: 'Downtown Arena',
        format: 'Single Elimination',
        entryFee: '$200',
        prizePool: '$500',
        skillLevel: 'All Levels',
        merch: ['Shirt'],
        media: [],
        description: 'Compete in the Downtown Basketball Classic for a shot at $500! Open to all skill levels.'
    }
];

// --- Render Tournament List ---
function renderTournamentList() {
    const list = document.getElementById('tournament-list');
    if (!list) return;
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
            <p><strong>Branded Merch:</strong> ${event.merch.join(', ')}</p>
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

    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    // Build calendar header
    let html = `<div class='calendar-nav'>
        <button class='btn btn-secondary' id='prev-month'>&lt;</button>
        <span class='calendar-title'>${firstDay.toLocaleString('default', { month: 'long' })} ${year}</span>
        <button class='btn btn-secondary' id='next-month'>&gt;</button>
    </div>`;
    html += `<table class='calendar-table'><thead><tr>`;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d of days) html += `<th>${d}</th>`;
    html += `</tr></thead><tbody><tr>`;

    // Fill initial empty cells
    for (let i = 0; i < firstDay.getDay(); i++) html += `<td></td>`;

    // Fill days
    for (let date = 1; date <= lastDay.getDate(); date++) {
        const thisDate = new Date(year, month, date);
        const dateStr = thisDate.toISOString().slice(0, 10);
        const events = tournaments.filter(ev => ev.date === dateStr);
        let cellClass = '';
        if (
            thisDate.getDate() === today.getDate() &&
            thisDate.getMonth() === today.getMonth() &&
            thisDate.getFullYear() === today.getFullYear()
        ) {
            cellClass = 'calendar-today';
        }
        if (events.length > 0) cellClass += ' calendar-event-day';
        html += `<td class='${cellClass.trim()}' data-date='${dateStr}'>
            <div class='calendar-date-num'>${date}</div>`;
        if (events.length > 0) {
            for (let ev of events) {
                html += `<div class='calendar-event-summary' data-event-id='${ev.id}'>
                    <strong>${ev.name}</strong><br>
                    Fee: ${ev.entryFee}<br>
                    Prize: ${ev.prizePool}
                </div>`;
            }
        }
        html += `</td>`;
        if ((thisDate.getDay() + 1) % 7 === 0 && date !== lastDay.getDate()) html += `</tr><tr>`;
    }
    // Fill trailing empty cells
    for (let i = lastDay.getDay() + 1; i <= 7 && lastDay.getDay() !== 6; i++) html += `<td></td>`;
    html += `</tr></tbody></table>`;
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
    document.querySelectorAll('.calendar-event-summary').forEach(el => {
        el.onclick = (e) => {
            e.stopPropagation();
            const eventId = parseInt(el.getAttribute('data-event-id'));
            window.location.href = `event.html?id=${eventId}`;
        };
    });
}

// --- Render on Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderTournamentList();
    // Render calendar for current month
    const now = new Date();
    renderCalendar(now.getFullYear(), now.getMonth());
}); 