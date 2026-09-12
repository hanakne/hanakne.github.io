/* SDH Velké Svatoňovice - Frontend Application Logic */

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGER ---
    const AppState = {
        currentSection: 'uvod'
    };

    // --- DOM ELEMENTS ---
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link, .main-footer a[data-nav], .hero-buttons a[data-nav], .visit-cta a[data-nav]');
    const pages = document.querySelectorAll('.page-content');
    const mobileMenuToggle = document.getElementById('mobile-toggle');
    const mainNav          = document.getElementById('main-nav');

    // --- 2. MOBILE MENU ---
    const closeMobileMenu = () => {
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        if (mainNav)          mainNav.classList.remove('active');
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            if (mainNav) mainNav.classList.toggle('active');
        });
    }

    // --- 3. SPA ROUTING & NAVIGATION ---
    const navigateTo = (targetId) => {
        if (!targetId) return;

        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));

        // Find the destination page
        const targetPage = document.getElementById(`page-${targetId}`);
        if (targetPage) {
            targetPage.classList.add('active');
            AppState.currentSection = targetId;

            const hero = document.getElementById('hero');
            const heroHeight = hero ? hero.offsetHeight : 0;

            if (targetId === 'uvod') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: heroHeight, behavior: 'smooth' });
            }
        }

        // Update active class on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            const isMatch = link.getAttribute('data-target') === targetId || link.getAttribute('href') === `#${targetId}`;
            link.classList.toggle('active', isMatch);
        });

        closeMobileMenu();
    };

    // Bind event listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let targetId = link.getAttribute('data-target') || link.getAttribute('data-nav');
            if (!targetId) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    targetId = href.substring(1);
                }
            }
            if (targetId) {
                navigateTo(targetId);
                try {
                    history.pushState(null, null, `#${targetId}`);
                } catch (e) {}
            }
        });
    });

    // Handle browser back / forward
    window.addEventListener('popstate', () => {
        const hash = window.location.hash ? window.location.hash.substring(1) : 'uvod';
        navigateTo(hash || 'uvod');
    });

    // Handle initial hash on page load
    const initialHash = window.location.hash ? window.location.hash.substring(1) : '';
    if (initialHash) {
        navigateTo(initialHash);
    }

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('uvod');
            try {
                history.pushState(null, null, '#uvod');
            } catch (e) {}
        });
    }

});
