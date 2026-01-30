import { animate, createTimeline } from 'animejs';

// 3D Tilt Effect for cards
export class Tilt3D {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            maxTilt: options.maxTilt || 15,
            perspective: options.perspective || 1000,
            scale: options.scale || 1.02,
            speed: options.speed || 400,
            glare: options.glare !== false,
            ...options
        };
        
        this.glareElement = null;
        this.init();
    }
    
    init() {
        // Set perspective on parent
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = `transform ${this.options.speed}ms ease-out`;
        
        // Add glare element
        if (this.options.glare) {
            this.glareElement = document.createElement('div');
            this.glareElement.className = 'tilt-glare';
            this.glareElement.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%);
                opacity: 0;
                transition: opacity ${this.options.speed}ms ease-out;
                pointer-events: none;
                border-radius: inherit;
                z-index: 10;
            `;
            this.element.appendChild(this.glareElement);
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
        this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
    }
    
    onMouseEnter(e) {
        this.element.style.willChange = 'transform';
    }
    
    onMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / (rect.height / 2)) * -this.options.maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * this.options.maxTilt;
        
        this.element.style.transform = `
            perspective(${this.options.perspective}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
        `;
        
        // Update glare
        if (this.glareElement) {
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            this.glareElement.style.background = `
                radial-gradient(circle at ${glareX}% ${glareY}%, 
                rgba(255,255,255,0.3) 0%, 
                rgba(255,255,255,0.1) 40%, 
                transparent 70%)
            `;
            this.glareElement.style.opacity = '1';
        }
    }
    
    onMouseLeave(e) {
        this.element.style.transform = '';
        this.element.style.willChange = 'auto';
        
        if (this.glareElement) {
            this.glareElement.style.opacity = '0';
        }
    }
    
    destroy() {
        this.element.style.transform = '';
        if (this.glareElement) {
            this.glareElement.remove();
        }
    }
}

// Magnetic Button Effect
export class MagneticButton {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            strength: options.strength || 0.3,
            ease: options.ease || 0.15,
            ...options
        };
        
        this.boundingRect = null;
        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.isHovering = false;
        this.rafId = null;
        
        this.init();
    }
    
    init() {
        this.element.style.transition = 'transform 0.3s ease-out';
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('mouseenter', (e) => {
            this.isHovering = true;
            this.boundingRect = this.element.getBoundingClientRect();
            this.element.style.transition = 'none';
            this.animate();
        });
        
        this.element.addEventListener('mousemove', (e) => {
            if (!this.boundingRect) return;
            
            const centerX = this.boundingRect.left + this.boundingRect.width / 2;
            const centerY = this.boundingRect.top + this.boundingRect.height / 2;
            
            this.targetPosition.x = (e.clientX - centerX) * this.options.strength;
            this.targetPosition.y = (e.clientY - centerY) * this.options.strength;
        });
        
        this.element.addEventListener('mouseleave', (e) => {
            this.isHovering = false;
            this.targetPosition = { x: 0, y: 0 };
            this.element.style.transition = 'transform 0.3s ease-out';
            this.element.style.transform = '';
            
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        });
    }
    
    animate() {
        if (!this.isHovering && Math.abs(this.position.x) < 0.1 && Math.abs(this.position.y) < 0.1) {
            return;
        }
        
        this.position.x += (this.targetPosition.x - this.position.x) * this.options.ease;
        this.position.y += (this.targetPosition.y - this.position.y) * this.options.ease;
        
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
        
        this.rafId = requestAnimationFrame(() => this.animate());
    }
}

// Scroll Progress Indicator
export class ScrollProgress {
    constructor(options = {}) {
        this.options = {
            color: options.color || '#00d4ff',
            height: options.height || 3,
            position: options.position || 'top',
            ...options
        };
        
        this.progressBar = null;
        this.init();
    }
    
    init() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'scroll-progress-bar';
        this.progressBar.style.cssText = `
            position: fixed;
            ${this.options.position}: 0;
            left: 0;
            width: 0%;
            height: ${this.options.height}px;
            background: ${this.options.color};
            box-shadow: 0 0 10px ${this.options.color};
            z-index: 9999;
            transition: width 0.1s ease-out;
        `;
        
        document.body.appendChild(this.progressBar);
    }
    
    update(progress) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress * 100}%`;
        }
    }
    
    destroy() {
        if (this.progressBar) {
            this.progressBar.remove();
        }
    }
}

// Reveal on scroll (fade up)
export class RevealOnScroll {
    constructor(selector = '[data-reveal]', options = {}) {
        this.selector = selector;
        this.options = {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px 0px -50px 0px',
            duration: options.duration || 1000,
            delay: options.delay || 0,
            y: options.y || 60,
            ...options
        };
        
        this.observer = null;
        this.init();
    }
    
    init() {
        const elements = document.querySelectorAll(this.selector);
        
        // Set initial state
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = `translateY(${this.options.y}px)`;
            el.style.transition = `opacity ${this.options.duration}ms ease-out, transform ${this.options.duration}ms ease-out`;
        });
        
        // Create observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.revealed) {
                    entry.target.dataset.revealed = 'true';
                    
                    const delay = parseInt(entry.target.dataset.revealDelay) || this.options.delay;
                    
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, delay);
                }
            });
        }, {
            threshold: this.options.threshold,
            rootMargin: this.options.rootMargin
        });
        
        elements.forEach(el => this.observer.observe(el));
    }
    
    refresh() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.init();
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize all effects
export function initEffects() {
    // Add 3D tilt to morph card
    const morphCard = document.querySelector('.morph-card');
    if (morphCard) {
        new Tilt3D(morphCard, {
            maxTilt: 8,
            scale: 1.01,
            glare: true
        });
    }
    
    // Add magnetic effect to contact links
    document.querySelectorAll('.contact-link, .nav-link').forEach(link => {
        new MagneticButton(link, {
            strength: 0.4,
            ease: 0.15
        });
    });
    
    // Initialize reveal animations
    new RevealOnScroll('[data-reveal]', {
        duration: 1000,
        y: 60
    });
    
    // Stagger reveal for groups
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('[data-reveal-stagger]');
                children.forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(40px)';
                    child.style.transition = `opacity 0.8s ease-out ${index * 100}ms, transform 0.8s ease-out ${index * 100}ms`;
                    
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('[data-reveal-group]').forEach(group => {
        observer.observe(group);
    });
}

export default {
    Tilt3D,
    MagneticButton,
    ScrollProgress,
    RevealOnScroll,
    initEffects
};
