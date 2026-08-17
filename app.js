/* SDH Velké Svatoňovice - Frontend Application Logic */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGER ---
    const AppState = {
        currentTheme: 'dark-theme',
        currentSection: 'uvod',
        galleryItems: [],
        currentGalleryIndex: 0,
        alarmActive: false,
        alarmInterval: null,
        alarmSeconds: 0
    };

    // --- DOM ELEMENTS ---
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link, .main-footer a[data-nav], .hero-buttons a[data-nav], .visit-cta a[data-nav]');
    const pages = document.querySelectorAll('.page-content');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileMenuToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // Gallery & Lightbox Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    // Dispatch/Alarm Elements
    const demoTriggerBtn = document.getElementById('btn-demo-trigger');
    const alarmOverlay = document.getElementById('alarm-overlay');
    const alarmStopBtn = document.getElementById('btn-alarm-stop');
    const alarmTimerText = document.getElementById('alarm-time');
    const globalDispatchBadge = document.getElementById('global-dispatch-badge');
    const localStatusIndicator = document.getElementById('status-indicator');
    const localStatusTitle = document.getElementById('status-title');
    const localStatusDesc = document.getElementById('status-desc');
    
    // Contact Form Elements
    const contactForm = document.getElementById('contact-form');
    const formSuccessMsg = document.getElementById('form-success');
    const formResetBtn = document.getElementById('btn-form-reset');

    // --- 1. THEME SWITCHER (DARK/LIGHT MODE) ---
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            AppState.currentTheme = savedTheme;
        } else {
            // Default to dark theme if none saved
            AppState.currentTheme = 'dark-theme';
        }
        body.className = AppState.currentTheme;
    };

    const toggleTheme = () => {
        if (AppState.currentTheme === 'dark-theme') {
            AppState.currentTheme = 'light-theme';
        } else {
            AppState.currentTheme = 'dark-theme';
        }
        body.className = AppState.currentTheme;
        localStorage.setItem('theme', AppState.currentTheme);
    };

    themeToggleBtn.addEventListener('click', toggleTheme);
    initTheme();

    // --- 2. MOBILE MENU ---
    const toggleMobileMenu = () => {
        mobileMenuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
    };

    const closeMobileMenu = () => {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
    };

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // --- 3. SPA ROUTING & NAVIGATION ---
    const navigateTo = (targetId) => {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Find the destination page
        const targetPage = document.getElementById(`page-${targetId}`);
        if (targetPage) {
            targetPage.classList.add('active');
            AppState.currentSection = targetId;
            
            // Scroll to the content start, but keep header visible
            const headerHeight = document.querySelector('.main-header').offsetHeight;
            const heroHeight = document.getElementById('hero').offsetHeight;
            
            if (targetId === 'uvod') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Scroll down to the content wrapper
                window.scrollTo({
                    top: heroHeight,
                    behavior: 'smooth'
                });
            }
        }

        // Update active nav state
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        closeMobileMenu();
    };

    // Bind event listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Find target section name
            let targetId = link.getAttribute('data-target') || link.getAttribute('data-nav');
            
            if (!targetId) {
                // Parse from href if not in attributes (e.g. href="#jsdh")
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    targetId = href.substring(1);
                }
            }

            if (targetId) {
                navigateTo(targetId);
                // Update address bar hash subtly
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            navigateTo(hash);
        } else {
            navigateTo('uvod');
        }
    });

    // Initial routing on page load based on URL hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        navigateTo(initialHash);
    }

    // Logo click brings back to home
    document.getElementById('logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('uvod');
        history.pushState(null, null, '#uvod');
    });

    // --- 4. GALLERY FILTERS ---
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update filter buttons UI
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // --- 5. GALLERY LIGHTBOX ---
    // Extract visible items in correct order
    const getVisibleGalleryItems = () => {
        return Array.from(galleryItems).filter(item => item.style.display !== 'none');
    };

    const showLightbox = (index) => {
        const visibleItems = getVisibleGalleryItems();
        if (visibleItems.length === 0) return;
        
        AppState.galleryItems = visibleItems;
        AppState.currentGalleryIndex = index;

        const currentItem = visibleItems[index];
        const imgElement = currentItem.querySelector('img');
        const overlayTitle = currentItem.querySelector('.gallery-title')?.textContent || '';
        
        let src = '';
        if (imgElement) {
            src = imgElement.getAttribute('src');
        } else {
            // For placeholder gallery items, extract background gradient/style if necessary,
            // or use standard placeholder representations
            const placeholder = currentItem.querySelector('.gallery-placeholder-img');
            if (placeholder) {
                // Just display a nice template image
                src = 'assets/hero_bg.jpg'; // Fallback
            }
        }

        lightboxImg.setAttribute('src', src);
        lightboxCaption.textContent = overlayTitle;
        
        lightbox.classList.add('active');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
    };

    const navigateLightbox = (direction) => {
        const count = AppState.galleryItems.length;
        if (count === 0) return;

        let nextIndex = AppState.currentGalleryIndex + direction;
        
        // Wrap around limits
        if (nextIndex < 0) nextIndex = count - 1;
        if (nextIndex >= count) nextIndex = 0;

        showLightbox(nextIndex);
    };

    // Bind gallery click events
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const visibleItems = getVisibleGalleryItems();
            const visibleIndex = visibleItems.indexOf(item);
            if (visibleIndex !== -1) {
                showLightbox(visibleIndex);
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    // Close on overlay click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard support for gallery
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });

    // --- 6. EMERGENCY DISPATCH SIMULATION (DEMO) ---
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const startAlarmSimulation = () => {
        AppState.alarmActive = true;
        AppState.alarmSeconds = 0;
        alarmTimerText.textContent = '00:00';
        
        // Show alarm overlay
        alarmOverlay.classList.add('active');
        
        // Change global badge state
        globalDispatchBadge.className = 'dispatch-badge active-callout';
        globalDispatchBadge.innerHTML = `
            <span class="pulse-dot" style="background-color: red;"></span>
            <strong>AKTIVNÍ VÝJEZD JEDNOTKY</strong>
        `;
        
        // Change local status card indicator
        localStatusIndicator.className = 'status-indicator active-alarm';
        localStatusTitle.textContent = 'VYHLÁŠEN POPLACH - VÝJEZD';
        localStatusTitle.style.color = 'var(--color-primary-light)';
        localStatusDesc.textContent = 'Probíhá aktivní zásah! Jednotka vyjela na místo události. Členové plní úkoly na pokyn velitele.';
        
        // Start counter
        AppState.alarmInterval = setInterval(() => {
            AppState.alarmSeconds++;
            alarmTimerText.textContent = formatTime(AppState.alarmSeconds);
        }, 1000);
    };

    const stopAlarmSimulation = () => {
        AppState.alarmActive = false;
        clearInterval(AppState.alarmInterval);
        
        // Hide overlay
        alarmOverlay.classList.remove('active');
        
        // Reset global badge state
        globalDispatchBadge.className = 'dispatch-badge';
        globalDispatchBadge.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            JSDH V POHOTOVOSTI
        `;
        
        // Reset local status card indicator
        localStatusIndicator.className = 'status-indicator ready';
        localStatusTitle.textContent = 'JSDH V POHOTOVOSTI';
        localStatusTitle.style.color = 'var(--color-success)';
        localStatusDesc.textContent = 'Jednotka je plně připravena k výjezdu. Všichni členové jsou na příjmu.';
    };

    demoTriggerBtn.addEventListener('click', startAlarmSimulation);
    alarmStopBtn.addEventListener('click', stopAlarmSimulation);

    // --- 7. CONTACT FORM SUBMISSION ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Show loading animation on button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Odesílám zprávu...';
            submitBtn.style.opacity = '0.7';

            // Simulate server network latency
            setTimeout(() => {
                // Hide form, show success
                contactForm.style.display = 'none';
                formSuccessMsg.style.display = 'flex';
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.style.opacity = '1';
                
                // Clear fields
                contactForm.reset();
            }, 1500);
        });
    }

    if (formResetBtn) {
        formResetBtn.addEventListener('click', () => {
            // Restore form visibility
            formSuccessMsg.style.display = 'none';
            contactForm.style.display = 'flex';
        });
    }
});
