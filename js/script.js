class TypeWriterElement extends HTMLElement {
    connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;

        const wordsAttr = this.getAttribute('words') || "Trader ";
        this.words = wordsAttr.split(',').map(w => w.trim());
        this.speed = parseInt(this.getAttribute('speed')) || 80;
        this.delayBetweenWords = parseInt(this.getAttribute('delay')) || 2000;
        this.cursorChar = this.getAttribute('cursor') || "|";
        
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.displayText = "";

        this.innerHTML = `<span class="tw-text"></span><span class="tw-cursor" style="margin-left: 2px; transition: opacity 0.1s;">${this.cursorChar}</span>`;
        this.textSpan = this.querySelector('.tw-text');
        this.cursorSpan = this.querySelector('.tw-cursor');

        setInterval(() => {
            if (this.cursorSpan) {
                this.cursorSpan.style.opacity = this.cursorSpan.style.opacity === '0' ? '1' : '0';
            }
        }, 500);

        this.type();
    }

    type() {
        if (!this.isConnected) return; // Stop if removed from DOM
        const currentWord = this.words[this.wordIndex];

        if (!this.isDeleting) {
            if (this.charIndex < currentWord.length) {
                this.displayText = currentWord.substring(0, this.charIndex + 1);
                this.charIndex++;
                setTimeout(() => this.type(), this.speed);
            } else {
                setTimeout(() => {
                    this.isDeleting = true;
                    this.type();
                }, this.delayBetweenWords);
            }
        } else {
            if (this.charIndex > 0) {
                this.displayText = currentWord.substring(0, this.charIndex - 1);
                this.charIndex--;
                setTimeout(() => this.type(), this.speed / 2);
            } else {
                this.isDeleting = false;
                this.wordIndex = (this.wordIndex + 1) % this.words.length;
                setTimeout(() => this.type(), this.speed);
            }
        }

        if (this.textSpan) {
            this.textSpan.textContent = this.displayText;
        }
    }
}
customElements.define('type-writer', TypeWriterElement);

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            
            // Toggle hamburger animation if needed
            mobileBtn.classList.toggle('open');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
            });
        });
    }

    // Scroll Animation (Reveal Elements)
    function reveal() {
        // Excluded .section-header so it doesn't animate
        var reveals = document.querySelectorAll('.feature-card, .pricing-card, .performance-content, .blog-card, .hero-content');

        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 50;

            if (elementTop < windowHeight - elementVisible) {
                if (!reveals[i].classList.contains('active')) {
                    // Staggering based on index modulus for grid layouts
                    let delay = (i % 3) * 0.15;
                    if(reveals[i].classList.contains('performance-content')) delay = 0;
                    
                    reveals[i].style.transitionDelay = `${delay}s`;
                    reveals[i].classList.add('active');
                }
            } else {
                // If out of view, remove active class so it can play again
                reveals[i].style.transitionDelay = '0s';
                reveals[i].classList.remove('active');
            }
        }
    }

    // Add classes for initial states
    var toReveal = document.querySelectorAll('.feature-card, .pricing-card, .performance-content, .blog-card, .hero-content');
    toReveal.forEach(el => el.classList.add('reveal'));

    window.addEventListener('scroll', reveal);

    // Trigger once on load
    reveal();

    // Setup navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });



    // Chart Animation - Neon Purple Price Chart
    const canvas = document.getElementById('heroChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];
        const numPoints = 120;
        let progress = 0;
        let isWaiting = false;

        function generateData() {
            points = [];
            let pY = canvas.height - 40;
            points.push({ x: 0, y: pY });

            // Generate pseudo-data for an upward chart (Sharpe > 2 style)
            // 3 seconds animation at 60fps = 180 points
            const drift = (canvas.height - 80) / numPoints; // very steady upward trend

            for (let i = 1; i <= numPoints; i++) {
                const x = (i / numPoints) * canvas.width;
                pY -= drift;
                pY += (Math.random() * 12 - 5.5); // Very low volatility for high sharpe

                // Keep within canvas bounds
                pY = Math.max(30, Math.min(canvas.height - 20, pY));
                points.push({ x: x, y: pY });
            }
        }

        generateData();

        function drawChart() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (progress < numPoints) {
                // To make it ~3 seconds, advance slower (e.g. 120 points / 180 frames = 0.66)
                progress += 0.66;
            }

            const currentPoints = Math.floor(progress);

            // Draw Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i <= currentPoints; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            // Neon purple style
            ctx.strokeStyle = '#d47dfc';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#d47dfc';
            ctx.stroke();

            // Draw Gradient Fill beneath the line
            if (currentPoints > 0) {
                ctx.lineTo(points[currentPoints].x, canvas.height);
                ctx.lineTo(points[0].x, canvas.height);
                ctx.closePath();

                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(176, 0, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(10, 17, 40, 0)');

                ctx.shadowBlur = 0; // Turn off glow for fill
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            if (progress < numPoints) {
                requestAnimationFrame(drawChart);
            } else if (!isWaiting) {
                // Loop the animation after a short delay
                isWaiting = true;
                setTimeout(() => {
                    generateData();
                    progress = 0;
                    isWaiting = false;
                    requestAnimationFrame(drawChart);
                }, 1500); // 1.5 seconds delay before drawing a new random chart
            }
        }

        // Start animation when visible to user
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Delay slightly for better effect after page load
                setTimeout(drawChart, 300);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        observer.observe(canvas);
    } // End of heroChart block

    // Global Page Background Animation - Floating Particles
    const bgLayer = document.querySelector('.bg-layer');
    if (bgLayer) {
        let pageBgCanvas = document.createElement('canvas');
        pageBgCanvas.id = 'page-bg-canvas';
        bgLayer.insertBefore(pageBgCanvas, bgLayer.firstChild);

        const bgCtx = pageBgCanvas.getContext('2d');
        let width, height;

        // Particles
        const particles = [];
        const particleCount = 150; // Amount of stars/particles

        function resizeBg() {
            width = pageBgCanvas.width = window.innerWidth;
            height = pageBgCanvas.height = window.innerHeight;
            
            // Re-distribute particles perfectly across the new screen size to prevent clustering
            if (particles.length > 0) {
                particles.forEach(p => {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                });
            }
        }

        window.addEventListener('resize', resizeBg);
        resizeBg();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4 - 0.1, // Drift slightly up
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.6 + 0.2
            });
        }

        function drawGlobalBg() {
            // Clear entire canvas
            bgCtx.clearRect(0, 0, width, height);

            // Draw floating particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                bgCtx.beginPath();
                bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                bgCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                bgCtx.fill();
            });

            requestAnimationFrame(drawGlobalBg);
        }

        drawGlobalBg();
    }
    
    // FAQ Accordion
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const answer = button.nextElementSibling;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                if(item.querySelector('.faq-answer')) {
                    item.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            if (!isActive) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
