/* ==========================================
   PORTFOLIO WEBSITE JAVASCRIPT
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  initNavigation();
  initTypingEffect();
  initScrollAnimations();
  initSkillsAnimation();
  initFormValidation();
  initBackToTop();
  initSmoothScroll();

  // Set current year in footer
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ==========================================
   NAVIGATION & MOBILE MENU
   ========================================== */
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Toggle mobile menu
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close mobile menu on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Navbar background on scroll
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    // Add background blur after scrolling 50px
    if (currentScroll > 50) {
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
    } else {
      navbar.style.boxShadow = "none";
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();

    lastScroll = currentScroll;
  });
}

/* ==========================================
   TYPING EFFECT
   ========================================== */
function initTypingEffect() {
  const textElement = document.querySelector(".typing-text");
  const phrases = [
    "Full Stack Software Engineer",
    "Backend Developer",
    "Frontend Specialist",
    "Problem Solver",
    "Code Artisan",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      textElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      textElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  // Start typing effect
  type();
}

/* ==========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ========================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // If it's a skill item, animate the progress bar
        if (entry.target.classList.contains("skill-item")) {
          animateSkillBar(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });
}

/* ==========================================
   SKILLS ANIMATION
   ========================================== */
function initSkillsAnimation() {
  const skillItems = document.querySelectorAll(".skill-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSkillBar(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  skillItems.forEach((item) => observer.observe(item));
}

function animateSkillBar(skillItem) {
  const level = skillItem.getAttribute("data-level");
  const fill = skillItem.querySelector(".progress-fill");
  const percentage = skillItem.querySelector(".percentage");

  if (fill && level) {
    setTimeout(() => {
      fill.style.width = `${level}%`;

      // Animate percentage counter
      if (percentage) {
        animateCounter(percentage, 0, parseInt(level), 1500);
      }
    }, 200);
  }
}

function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = `${Math.floor(progress * (end - start) + start)}%`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/* ==========================================
   FORM VALIDATION
   ========================================== */
function initFormValidation() {
  const form = document.getElementById("contact-form");
  const formStatus = document.querySelector(".form-status");

  form.addEventListener("submit", (e) => {
    // Reset previous errors
    clearErrors();

    // Validate fields
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    let isValid = true;

    // Name validation
    if (name.value.trim().length < 2) {
      showError(name, "Please enter a valid name (min 2 characters)");
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      showError(email, "Please enter a valid email address");
      isValid = false;
    }

    // Message validation
    if (message.value.trim().length < 10) {
      showError(message, "Message must be at least 10 characters");
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      showFormStatus("error", "Please fix the errors above.");
      return false;
    }

    // If valid, allow Formspree to submit naturally
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
  });

  // Real-time validation
  ["name", "email", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => {
      validateField(field);
    });

    field.addEventListener("input", () => {
      if (field.parentElement.classList.contains("error")) {
        validateField(field);
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const formGroup = field.parentElement;
  let errorMessage = "";

  switch (field.id) {
    case "name":
      if (value.length < 2) errorMessage = "Name must be at least 2 characters";
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) errorMessage = "Please enter a valid email";
      break;
    case "message":
      if (value.length < 10)
        errorMessage = "Message must be at least 10 characters";
      break;
  }

  if (errorMessage) {
    showError(field, errorMessage);
    return false;
  } else {
    clearFieldError(field);
    return true;
  }
}

function showError(field, message) {
  const formGroup = field.parentElement;
  const errorElement = formGroup.querySelector(".error-message");

  formGroup.classList.add("error");
  errorElement.textContent = message;
}

function clearFieldError(field) {
  const formGroup = field.parentElement;
  formGroup.classList.remove("error");
}

function clearErrors() {
  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error");
  });
}

function showFormStatus(type, message) {
  const formStatus = document.querySelector(".form-status");
  formStatus.className = `form-status ${type}`;
  formStatus.textContent = message;
  formStatus.style.display = "block";
}

/* ==========================================
   SMOOTH SCROLL
   ========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/* ==========================================
   UPDATE ACTIVE NAV LINK
   ========================================== */
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");

    if (scrollPos >= top && scrollPos < top + height) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${id}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

/* ==========================================
   BACK TO TOP
   ========================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 500) {
      backToTopBtn.style.opacity = "1";
      backToTopBtn.style.visibility = "visible";
    } else {
      backToTopBtn.style.opacity = "0";
      backToTopBtn.style.visibility = "hidden";
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ==========================================
   KEYBOARD NAVIGATION SUPPORT
   ========================================== */
document.addEventListener("keydown", (e) => {
  // Close mobile menu on Escape
  if (e.key === "Escape") {
    const navMenu = document.getElementById("nav-menu");
    const navToggle = document.getElementById("nav-toggle");

    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});

/* ==========================================
   PERFORMANCE: Pause animations when tab is hidden
   ========================================== */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.body.classList.add("paused");
  } else {
    document.body.classList.remove("paused");
  }
});
