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
    const testimonial = testimonials[currentTestimonial];
    document.getElementById('testimonial-text').innerText = testimonial.text;
    document.getElementById('testimonial-name').innerText = testimonial.name;
    document.getElementById('testimonial-role').innerText = testimonial.role;

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
    const targetDate = new Date('July 31, 2026').getTime();
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').innerText = days;
        document.getElementById('countdown-hours').innerText = hours;
        document.getElementById('countdown-minutes').innerText = minutes;
        document.getElementById('countdown-seconds').innerText = seconds;

        if (distance < 0) {
            clearInterval(timer);
            document.querySelector('.countdown-container').innerText = 'Event is live!';
        }
    }, 1000);
}

// Initialize countdown on page load
if (document.getElementById('countdown-days')) {
    updateCountdown();
}

// ===== WEB3FORMS CONTACT FORM =====
const form = document.getElementById('contact-form');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("access_key", "ae20e5d4-b4a4-4e61-af8a-ca4c5277738f");

    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Success! Your message has been sent.");
            form.reset();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

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
