document.addEventListener('DOMContentLoaded', function() {
    let currentSlide = 0;
    let slideInterval;
    const slides = document.querySelectorAll('.news-slide');
    const dots = document.querySelectorAll('.dot');
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        currentSlide = n;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function startSlider() {
        slideInterval = setInterval(nextSlide, 1000);
    }
    
    function stopSlider() {
        clearInterval(slideInterval);
    }
    
    const sliderContainer = document.querySelector('.news-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSlider);
        sliderContainer.addEventListener('mouseleave', startSlider);
    }
    
    startSlider();

    // Animate statistics counters
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    stat.textContent = '+' + Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = '+' + target;
                }
            };
            
            updateCounter();
        });
    };

    // Trigger counter animation on page load
    animateCounters();
});
