import { animate, createTimeline } from 'animejs';
import { scrollInstance } from './scroll.js';

class Navigation {
    constructor() {
        this.nav = null;
        this.progressBar = null;
        this.sections = [];
        this.currentSection = '';
        this.isVisible = false;
        this.lastScrollY = 0;

        this.init();
    }

    init() {
        this.createNavigation();
        this.findSections();
        this.addEventListeners();
        this.setupIntersectionObserver();
    }

    createNavigation() {
        this.nav = document.createElement('nav');
        this.nav.className = 'main-nav';
        this.nav.innerHTML = `
            <div class="nav-brand">
                <a href="#hero" data-scroll-to>HZ</a>
            </div>
            <ul class="nav-links">
                <li><a href="#hero" class="nav-link" data-scroll-to>Home</a></li>
                <li><a href="#projects" class="nav-link" data-scroll-to>Work</a></li>
                <li><a href="#contact" class="nav-link" data-scroll-to>Contact</a></li>
            </ul>
            <div class="nav-progress">
                <div class="nav-progress-fill"></div>
            </div>
        `;

        document.body.appendChild(this.nav);
    }

    findSections() {
        this.sections = Array.from(document.querySelectorAll('section[id]')).map(section => ({
            id: section.id,
            element: section
        }));
    }

    addEventListeners() {
        // Smooth scroll to sections
        this.nav.addEventListener('click', (e) => {
            if (e.target.matches('[data-scroll-to]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    this.smoothScrollTo(target);
                }
            }
        });

        // Show/hide nav on scroll
        window.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });
    }

    smoothScrollTo(target) {
        // Use Lenis for smooth scrolling if available, fallback to custom implementation
        if (scrollInstance) {
            scrollInstance.scrollTo(target, {
                offset: 0,
                duration: 1.5,
            });
        } else {
            // Fallback for when Lenis isn't ready
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        const heroHeight = document.querySelector('#hero')?.offsetHeight || window.innerHeight;

        // Show nav after scrolling past hero
        if (scrollY > heroHeight * 0.5) {
            if (!this.isVisible) {
                this.isVisible = true;
                this.nav.classList.add('visible');
            }
        } else {
            if (this.isVisible) {
                this.isVisible = false;
                this.nav.classList.remove('visible');
            }
        }

        // Update nav progress fill
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, scrollY / docHeight));
        
        const navProgress = this.nav.querySelector('.nav-progress-fill');
        if (navProgress) {
            navProgress.style.width = `${progress * 100}%`;
        }

        this.lastScrollY = scrollY;
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.currentSection = entry.target.id;
                    this.updateActiveLink();
                }
            });
        }, {
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        });

        this.sections.forEach(({ element }) => {
            observer.observe(element);
        });
    }

    updateActiveLink() {
        const links = this.nav.querySelectorAll('.nav-link');
        links.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === this.currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

let navInstance = null;

export function initNavigation() {
    if (!navInstance) {
        navInstance = new Navigation();
    }
    return navInstance;
}
