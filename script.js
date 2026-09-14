/**
 * Main JavaScript File
 * Handles responsive navigation, scroll effects, lazy-loading animations,
 * and the interactive hero section canvas.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle Logic
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevent background scrolling when mobile menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    // Close the mobile menu when a navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 2. Navbar Scroll Effect (adds a shadow and shrinks the navbar on scroll)
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animation using Intersection Observer
    const fadeInSections = document.querySelectorAll('.fade-in-section');

    const appearOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Slight offset so it animates right as it comes into view
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return; // Not visible, skip
            } else {
                // Add class to trigger CSS animation
                entry.target.classList.add('is-visible');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    fadeInSections.forEach(section => {
        appearOnScroll.observe(section);
    });

    // 4. Hero Section Animated Canvas (Tech / Neural Network theme)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const mouse = { x: null, y: null, radius: 150 };
        
        const heroSection = document.getElementById('home');

        function resizeCanvas() {
            width = heroSection.offsetWidth;
            height = heroSection.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        }

        window.addEventListener('resize', resizeCanvas);

        // Pointer interactions for both mouse and touch
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        heroSection.addEventListener('touchmove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        });
        
        heroSection.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        heroSection.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 2 + 1;
                this.baseColor = '#A020F0';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges smoothly
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.baseColor;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Calculate number of particles based on screen size to maintain performance
            let numParticles = Math.floor((width * height) / 12000);
            numParticles = Math.min(numParticles, 120); // Cap at 120 max particles
            
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect to nearby particles
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(160, 32, 240, ${0.4 - distance / 300})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Connect and react to mouse pointer
                if (mouse.x != null && mouse.y != null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        // Draw connecting line to mouse pointer
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(180, 77, 242, ${0.8 - distance / mouse.radius})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        // Subtle magnetic push effect when pointer gets close
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const pushFactor = 0.5;
                        
                        particles[i].x += forceDirectionX * force * pushFactor;
                        particles[i].y += forceDirectionY * force * pushFactor;
                    }
                }
            }
        }

        // Init with a slight delay to ensure layout is fully rendered
        setTimeout(() => {
            resizeCanvas();
            animate();
        }, 100);
    }

    // 5. Windows 10 Taskbar Functionality
    function updateTaskbarClock() {
        const timeEl = document.getElementById('taskbar-time');
        const dateEl = document.getElementById('taskbar-date');
        
        if (timeEl && dateEl) {
            const now = new Date();
            
            // Format Time (HH:MM)
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}`;
            
            // Format Date (DD/MM/YYYY)
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-11
            const year = now.getFullYear();
            dateEl.textContent = `${day}/${month}/${year}`;
        }
    }

    // Update clock immediately, then every second
    updateTaskbarClock();
    setInterval(updateTaskbarClock, 1000);

    // Show Desktop button functionality
    const showDesktopBtn = document.getElementById('show-desktop');
    if (showDesktopBtn) {
        showDesktopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
