document.addEventListener('DOMContentLoaded', () => {
    // Reveal animation for cards
    const cards = document.querySelectorAll('.animate-in');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
            card.classList.add('fadeInUp');
        }, 100 * index);
    });

    // Simple counter animation for stats
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const value = parseInt(stat.innerText.replace(/,/g, ''));
        if (!isNaN(value)) {
            animateValue(stat, 0, value, 1500);
        }
    });

    console.log('تقرير فرع السيوف محمل بنجاح | Digital Report System Loaded');
});
