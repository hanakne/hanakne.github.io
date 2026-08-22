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