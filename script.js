// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ===== SMOOTH SCROLL FUNCTION =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        if (hamburger) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    }
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 50000;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / speed;

        const updateCounter = () => {
            const count = +counter.innerText;
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCounter, 60);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
let statsAnimated = false;

if (statsSection) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                animateCounters();
                statsAnimated = true;
            }
        });
    });
    observer.observe(statsSection);
}

// ===== SHOW MORE ABOUT SECTION =====
function toggleAbout() {
    const moreText = document.getElementById('more-text');
    const btn = document.getElementById('show-more-btn');

    if (moreText.classList.contains('hidden')) {
        moreText.classList.remove('hidden');
        btn.innerText = 'Show Less';
    } else {
        moreText.classList.add('hidden');
        btn.innerText = 'Show More';
    }
}

// ===== SHOW MORE TEAM MEMBERS =====
function toggleTeam() {
    const hiddenTeam = document.getElementById('hidden-team');
    const btn = document.getElementById('see-more-team');

    if (hiddenTeam.style.display === 'none' || hiddenTeam.style.display === '') {
        hiddenTeam.style.display = 'grid';
        btn.innerText = 'See Less';
    } else {
        hiddenTeam.style.display = 'none';
        btn.innerText = 'See More';
    }
}

// ===== TESTIMONIAL CAROUSEL =====
const testimonials = [
    {
        text: "Since its inception, Olaoluwa has set a high standard for how community-based age groups should function, bringing about a paradigm shift. It is no longer about merriment as usual, but about driving meaningful and lasting change.",
        name: "Marius Adeniyi",
        role: "Medical Doctor",
        image: "marius.jpg"
    },
{
        text: "It is no longer rumour or hearsay that the Olaoluwa Age Group consistently makes the community more lovely and lively each year. This impactful initiative is designed to restore hope by improving the lives of ordinary people. Its programmes include scholarship awards for outstanding pupils, distribution of food items, support for the aged and indigent, and organizing street games with attractive prizes. Personally, I am impressed by this commendable effort. Kudos to the organizers.",
        name: "Oluwole Austin",
        role: "Youth Leader",
        image: "oluwole.jpg"
    },
    {
        text: "I am sincerely grateful to Olaoluwa Age Group for organizing the spelling bee competition. It motivated me to study harder and believe in myself. Winning second position has inspired me to aim higher and improve my academic skills. Thank you for creating opportunities that encourage learning and support young talents in our community.",
        name: "Master John",
        role: "Beneficiary",
        image: "john.jpg"
    },
    {
        text: "Olaoluwa Age Group has become a shining example of purposeful community leadership. Through consistent initiatives in education, youth empowerment, and social development, their impact is clearly felt across the community. The group’s commitment to uplifting lives, promoting unity, and addressing real community needs is commendable..",
        name: "Leo Olatunji",
        role: "Lawyer",
        image: "leo.jpg"
    }
];

let currentTestimonial = 8;

function updateTestimonial() {
    const textEl = document.getElementById('testimonial-text');
    const nameEl = document.getElementById('testimonial-name');
    const roleEl = document.getElementById('testimonial-role');

    // These elements only exist on the homepage — skip on all other pages
    if (!textEl || !nameEl || !roleEl) return;

    const testimonial = testimonials[currentTestimonial];
    textEl.innerText = testimonial.text;
    nameEl.innerText = testimonial.name;
    roleEl.innerText = testimonial.role;

    const photo = document.querySelector('.testimonial-photo img');
    if (photo) {
        photo.src = testimonial.image;
    }
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonial();
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    updateTestimonial();
}

// ===== AUTO-PLAY TESTIMONIALS =====
let testimonialInterval;

function startTestimonialAutoPlay() {
    testimonialInterval = setInterval(() => {
        nextTestimonial();
    }, 8000);  // 8000 milliseconds = 8 seconds
}

function stopTestimonialAutoPlay() {
    clearInterval(testimonialInterval);
}

// Start auto-play when page loads
startTestimonialAutoPlay();

// Pause auto-play when user hovers over testimonial section
const testimonialContainer = document.querySelector('.testimonial-container');
if (testimonialContainer) {
    testimonialContainer.addEventListener('mouseenter', stopTestimonialAutoPlay);
    testimonialContainer.addEventListener('mouseleave', startTestimonialAutoPlay);
}

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    const targetDate = new Date('August 5, 2027').getTime();
    const timer = setInterval(renderCountdown, 1000);

    function renderCountdown() {
        const distance = targetDate - Date.now();
        if (distance <= 0) {
            clearInterval(timer);
            document.querySelector('.countdown-content').textContent = 'The event is live!';
            return;
        }

        const values = [
            { id: 'countdown-days', value: Math.floor(distance / (1000 * 60 * 60 * 24)), label: 'days' },
            { id: 'countdown-hours', value: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), label: 'hours' },
            { id: 'countdown-minutes', value: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), label: 'minutes' },
            { id: 'countdown-seconds', value: Math.floor((distance % (1000 * 60)) / 1000), label: 'seconds' }
        ];

        values.forEach(({ id, value, label }) => {
            const display = document.getElementById(id);
            if (!display) return;

            const digits = String(value).padStart(2, '0');
            if (display.dataset.value === digits) return;
            display.dataset.value = digits;
            display.closest('.countdown-box')?.setAttribute('aria-label', `${value} ${label} remaining`);
            display.replaceChildren(...Array.from(digits, (digit) => {
                const card = document.createElement('span');
                card.className = 'countdown-digit';
                card.setAttribute('aria-hidden', 'true');
                card.textContent = digit;
                return card;
            }));
        });
    }

    renderCountdown();
}

// Initialize countdown on page load
if (document.getElementById('countdown-days')) {
    updateCountdown();
}


// ===== MAKE LINKS PROGRAMMATIC =====
document.addEventListener('DOMContentLoaded', function() {
    // Convert navigation links to use scrollToSection
    const navLinks = document.querySelectorAll('.nav-links a[onclick], .footer-links a[onclick]');
    navLinks.forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes('scrollToSection')) {
            link.style.cursor = 'pointer';
        }
    });
});
