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

    // --- 4. ALBUM FOTOGALERIE & LIGHTBOX ---
    const albumData = {
        muzeum: {
            name: 'Oslavy 25 let muzea',
            photos: [
                { src: 'assets/oslavy_muzeum/oslavy_muzeum.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy2.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy3.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy4.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy5.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy6.jpg'},
                { src: 'assets/oslavy_muzeum/oslavy7.jpg'},
            ]
        },
        technika: {
            name: 'Technika sboru',
            photos: [
                { src: 'assets/da_ford.jpg'},
                { src: 'assets/da_avia.jpg'},
                { src: 'assets/da_vejda1.jpg'},
            ]
        },
        ples: {
            name: 'Hasičský ples 2026',
            photos: [
                { src: 'assets/ples.jpg'},
                { src: 'assets/ples2.jpg'},
                { src: 'assets/ples3.jpg'},
            ]
        },
        sezona_26: {
            name: 'Sezona 2026',
            photos: [
                { src: 'assets/sezona_26/marsov_26.jpg'},
                { src: 'assets/sezona_26/trenink_26.jpg'},
                { src: 'assets/sezona_26/okres_26.jpg'},
                { src: 'assets/sezona_26/libnatov_26.jpg'},
                { src: 'assets/sezona_26/rudnik_26.jpg'},
                { src: 'assets/sezona_26/nocky.jpg'},
                { src: 'assets/sezona_26/lanzov_26.jpg'},
            ]
        }
    };

    const AlbumState = {
        photos: [],
        index: 0,
        touchStartX: 0,
        touchEndX: 0
    };

    const albumLightbox  = document.getElementById('album-lightbox');
    const albumLbImg     = document.getElementById('album-lb-img');
    const albumLbTitle   = document.getElementById('album-lb-title');
    const albumLbCounter = document.getElementById('album-lb-counter');
    const albumLbThumbs  = document.getElementById('album-lb-thumbs');
    const albumLbClose   = document.getElementById('album-lb-close');
    const albumLbPrev    = document.getElementById('album-lb-prev');
    const albumLbNext    = document.getElementById('album-lb-next');

    if (albumLightbox) {
        const renderAlbumLightbox = (index) => {
            if (!AlbumState.photos.length) return;
            AlbumState.index = index;
            const photo = AlbumState.photos[index];

            if (albumLbImg) {
                albumLbImg.src = photo.src;
                albumLbImg.alt = photo.caption || '';
            }
            if (albumLbCounter) {
                albumLbCounter.textContent = `${index + 1} / ${AlbumState.photos.length}`;
            }
            if (albumLbThumbs) {
                albumLbThumbs.querySelectorAll('.album-lb-thumb').forEach((th, i) => {
                    th.classList.toggle('active', i === index);
                });
            }
        };

        const openAlbum = (albumKey) => {
            const album = albumData[albumKey];
            if (!album || !album.photos.length) return;

            AlbumState.photos = album.photos;
            if (albumLbTitle) albumLbTitle.textContent = album.name;

            // Generate thumbnails
            if (albumLbThumbs) {
                albumLbThumbs.innerHTML = '';
                album.photos.forEach((photo, i) => {
                    const thumb = document.createElement('img');
                    thumb.src = photo.src;
                    thumb.alt = photo.caption || '';
                    thumb.className = 'album-lb-thumb';
                    thumb.addEventListener('click', (e) => {
                        e.stopPropagation();
                        renderAlbumLightbox(i);
                    });
                    albumLbThumbs.appendChild(thumb);
                });
            }

            renderAlbumLightbox(0);
            albumLightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeAlbum = () => {
            albumLightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        const navigateAlbum = (dir) => {
            const count = AlbumState.photos.length;
            if (count === 0) return;
            let next = AlbumState.index + dir;
            if (next < 0) next = count - 1;
            if (next >= count) next = 0;
            renderAlbumLightbox(next);
        };

        // Attach click to all album cards
        document.querySelectorAll('.album-card').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-album');
                openAlbum(key);
            });
        });

        if (albumLbClose) albumLbClose.addEventListener('click', closeAlbum);
        if (albumLbPrev)  albumLbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateAlbum(-1); });
        if (albumLbNext)  albumLbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateAlbum(1); });

        albumLightbox.addEventListener('click', (e) => {
            if (e.target === albumLightbox) closeAlbum();
        });

        // Keyboard navigation (Escape, Left, Right)
        document.addEventListener('keydown', (e) => {
            if (!albumLightbox.classList.contains('active')) return;
            if (e.key === 'Escape')     closeAlbum();
            if (e.key === 'ArrowLeft')  navigateAlbum(-1);
            if (e.key === 'ArrowRight') navigateAlbum(1);
        });

        // Touch swipe gestures for mobile
        albumLightbox.addEventListener('touchstart', (e) => {
            AlbumState.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        albumLightbox.addEventListener('touchend', (e) => {
            AlbumState.touchEndX = e.changedTouches[0].screenX;
            const diff = AlbumState.touchStartX - AlbumState.touchEndX;
            if (Math.abs(diff) > 45) {
                if (diff > 0) {
                    navigateAlbum(1); // Swipe left -> Next
                } else {
                    navigateAlbum(-1); // Swipe right -> Prev
                }
            }
        }, { passive: true });
    }

    // --- 5. CONTACT FORM ---
    const contactForm   = document.getElementById('contact-form');
    const formSuccessMsg= document.getElementById('form-success');
    const formResetBtn  = document.getElementById('btn-form-reset');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Odesílám zprávu...';
                submitBtn.style.opacity = '0.7';
            }

            setTimeout(() => {
                contactForm.style.display = 'none';
                if (formSuccessMsg) formSuccessMsg.style.display = 'flex';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                }
                contactForm.reset();
            }, 1000);
        });
    }

    if (formResetBtn && contactForm && formSuccessMsg) {
        formResetBtn.addEventListener('click', () => {
            formSuccessMsg.style.display = 'none';
            contactForm.style.display = 'flex';
        });
    }

});
