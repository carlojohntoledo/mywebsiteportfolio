document.querySelectorAll('.menu-radio').forEach(radio => {
    radio.addEventListener('click', () => {
        const href = radio.getAttribute('data-href');
        if (href) window.location.href = href;
    });
});