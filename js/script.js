document.addEventListener("DOMContentLoaded", function () {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Loader Logic
    const loader = document.getElementById('loader');
    const body = document.body;

    // Simulate loading time (or wait for resources)
    window.addEventListener('load', function () {
        setTimeout(function () {
            loader.classList.add('hidden');
            body.classList.remove('loading');

            // Remove loader from DOM after transition for performance
            setTimeout(function () {
                loader.style.display = 'none';
            }, 500);
        }, 800); // 800ms delay for visual effect
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });

    // ScrollSpy
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#contact') {
                // Special handling for pricing buttons going to contact
                // Fallthrough to standard logic but ensure target is correct
            }

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust for fixed navbar
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });
});
