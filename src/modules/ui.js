import { animate, stagger, createTimeline } from 'animejs';

class UIAnimations {
    constructor() {
        this.observers = [];
        this.animated = new Set(); // Track animated elements
        this.init();
    }

    init() {
        this.setInitialStates();
        this.setupObservers();
        this.animateHero();
    }

    setInitialStates() {
        const heroTitle = document.querySelector('[data-animate="title"]');
        const heroSubtitle = document.querySelector('[data-animate="subtitle"]');
        const scrollIndicator = document.querySelector('[data-animate="scroll"]');

        if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(60px)';
        }
        if (heroSubtitle) {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(40px)';
        }
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.transform = 'translateY(20px)';
        }

        document.querySelectorAll('[data-animate="section"]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
        });

        document.querySelectorAll('[data-animate="card"]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(80px)';
        });
    }

    animateHero() {
        const tl = createTimeline({
            defaults: { ease: 'outExpo' }
        });

        tl.add('[data-animate="title"]', {
            opacity: [0, 1],
            translateY: [60, 0],
            duration: 1200,
        }, 300);

        tl.add('[data-animate="subtitle"]', {
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 1000,
        }, 700);

        tl.add('[data-animate="scroll"]', {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
        }, 1100);
    }

    setupObservers() {
        this.createObserver('[data-animate="section"]', (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animated.add(entry.target);
                    // Single element fade in
                    animate(entry.target, {
                        opacity: [0, 1],
                        translateY: [50, 0],
                        duration: 800,
                        easing: 'outQuint'
                    });
                }
            });
        }, { threshold: 0.2 });

        // Observer for project cards with stagger effect
        this.createObserver('[data-animate="card"]', (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animated.add(entry.target);
                    animate(entry.target, {
                        opacity: [0, 1],
                        translateY: [80, 0],
                        duration: 1000,
                        easing: 'outExpo'
                    });
                }
            });
        }, { threshold: 0.15 });
    }

    createObserver(selector, callback, options = {}) {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
            const observer = new IntersectionObserver(callback, options);
            els.forEach(el => observer.observe(el));
            this.observers.push(observer);
        }
    }
}

export function initUI() {
    return new UIAnimations();
}
