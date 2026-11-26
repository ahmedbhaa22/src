/* ============================================================
   SRC V2 — script.js
   - Loader dismiss
   - Navbar: scrolled class + active link on scroll
   - AOS init
   - Counter animation (IntersectionObserver)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Loader ──────────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 900);
    });
  }

  /* ── Navbar: add .scrolled on scroll ─────────────────────── */
  const navbar = document.getElementById('mainNav');
  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar && navbar.classList.add('scrolled');
    } else {
      navbar && navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ── Navbar: active link highlight ──────────────────────── */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    const scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ── Smooth scroll for anchor clicks ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        const navCollapse = document.getElementById('navbarNav');
        if (navCollapse && navCollapse.classList.contains('show')) {
          const toggler = document.querySelector('.navbar-toggler');
          toggler && toggler.click();
        }
      }
    });
  });

  /* ── AOS Init ─────────────────────────────────────────────── */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
      offset: 60
    });
  }

  /* ── Counter Animation ────────────────────────────────────── */
  const countEls = document.querySelectorAll('.count-up');
  if (countEls.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    countEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600; // ms
    const stepTime = 16;   // ~60fps
    const steps = Math.ceil(duration / stepTime);
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(function () {
      step++;
      // Ease-out: slow down near end
      current = target * easeOut(step / steps);
      el.textContent = Math.round(current);
      if (step >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, stepTime);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

});
