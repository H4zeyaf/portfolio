import { animate, createTimeline, stagger } from 'animejs';

// Project data for morphing
const PROJECTS = [
    {
        id: 'mhb-automobiles',
        category: 'Web Development',
        title: 'MHB Automobiles',
        description: 'Modernizing dealership management with seamless AJAX filtering and real-time comparisons.',
        tech: ['PHP', 'JavaScript', 'AJAX', 'MySQL', 'Anime.js'],
        icon: '🚗',
    },
    {
        id: 'llm-rig',
        category: 'Hardware Architecture',
        title: 'Multi-GPU Local LLM Rig',
        description: 'Architecting a dual-GPU workstation for high-performance local Large Language Model inference.',
        tech: ['RTX 5080', 'RTX 3080', 'Linux', 'CUDA', 'Lian Li O11D'],
        icon: '🧠',
    },
    {
        id: 'school-system',
        category: 'Software Engineering',
        title: 'C++ School Management',
        description: 'Optimizing data structures and file I/O for efficient student record management.',
        tech: ['C++', 'OOP', 'Memory Management', 'File I/O'],
        icon: '💻',
    },
    {
        id: 'arch-hyprland',
        category: 'DevOps / Customization',
        title: 'Arch + Hyprland Workflow',
        description: 'Extreme workflow optimization using tiling window managers and custom automation scripts.',
        tech: ['Arch Linux', 'Bash', 'Hyprland', 'Wayland'],
        icon: '🐧',
    },
];

class MorphCard {
    constructor() {
        this.container = document.querySelector('.morph-card-container');
        this.card = document.querySelector('.morph-card');
        this.projectsSection = document.querySelector('.projects');
        
        // Card elements
        this.categoryEl = this.card?.querySelector('.card-category');
        this.titleEl = this.card?.querySelector('.card-title');
        this.descriptionEl = this.card?.querySelector('.card-description');
        this.techEl = this.card?.querySelector('.card-tech');
        this.iconEl = this.card?.querySelector('.card-icon');
        this.dots = this.card?.querySelectorAll('.progress-dot');
        
        // State
        this.currentIndex = 0;
        this.isVisible = false;
        this.isMorphing = false;
        
        // Scroll boundaries (calculated on init)
        this.scrollStart = 0;
        this.scrollEnd = 0;
        
        if (this.card) {
            this.init();
        }
    }
    
    init() {
        // Set initial project content
        this.setProjectContent(0, false);
        
        // Calculate scroll boundaries
        this.calculateBoundaries();
        window.addEventListener('resize', () => this.calculateBoundaries());
        
        // Add click handlers to dots
        this.dots?.forEach((dot, index) => {
            dot.addEventListener('click', () => this.morphToProject(index));
        });
    }
    
    calculateBoundaries() {
        if (!this.projectsSection) return;
        
        const rect = this.projectsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Card becomes visible when projects section is 20% in view
        this.scrollStart = scrollTop + rect.top - window.innerHeight * 0.2;
        // Card hides when projects section is 80% scrolled
        this.scrollEnd = scrollTop + rect.top + rect.height - window.innerHeight * 0.3;
    }
    
    // Called every frame from scroll handler
    onScroll(scrollY, progress) {
        // Show/hide card based on scroll position
        const shouldShow = scrollY > this.scrollStart && scrollY < this.scrollEnd;
        
        if (shouldShow !== this.isVisible) {
            this.isVisible = shouldShow;
            this.toggleVisibility(shouldShow);
        }
        
        if (!this.isVisible) return;
        
        // Calculate which project should be shown based on scroll position
        const scrollRange = this.scrollEnd - this.scrollStart;
        const localProgress = (scrollY - this.scrollStart) / scrollRange;
        const targetIndex = Math.min(
            Math.floor(localProgress * PROJECTS.length),
            PROJECTS.length - 1
        );
        
        // Morph to new project if needed
        if (targetIndex !== this.currentIndex && targetIndex >= 0) {
            this.morphToProject(targetIndex);
        }
    }
    
    toggleVisibility(show) {
        if (show) {
            this.container.classList.add('visible');
            // Entrance animation
            animate(this.card, {
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 600,
                ease: 'outExpo',
            });
        } else {
            animate(this.card, {
                scale: [1, 0.95],
                opacity: [1, 0],
                duration: 400,
                easing: 'inQuad',
                complete: () => {
                    this.container.classList.remove('visible');
                }
            });
        }
    }
    
    morphToProject(index) {
        if (this.isMorphing || index === this.currentIndex) return;
        if (index < 0 || index >= PROJECTS.length) return;
        
        this.isMorphing = true;
        const oldIndex = this.currentIndex;
        this.currentIndex = index;
        
        // Update dots
        this.dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        // Create morph timeline
        const tl = createTimeline({
            defaults: {
                ease: 'outExpo',
            },
            complete: () => {
                this.isMorphing = false;
            }
        });
        
        // Phase 1: Fade out old content with stagger
        tl.add([this.categoryEl, this.titleEl, this.descriptionEl, this.techEl, this.iconEl], {
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 300,
            ease: 'inQuad',
            delay: stagger(30),
        }, 0);
        
        // Phase 2: Update content (at midpoint)
        tl.add({}, {
            duration: 1,
            complete: () => {
                this.setProjectContent(index, false);
            }
        }, 280);
        
        // Phase 3: Fade in new content with stagger
        tl.add([this.categoryEl, this.titleEl, this.descriptionEl, this.techEl, this.iconEl], {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            delay: stagger(50),
        }, 300);
        
        // Icon special animation
        tl.add(this.iconEl, {
            scale: [0.5, 1],
            rotate: ['-10deg', '0deg'],
            duration: 600,
        }, 350);
    }
    
    setProjectContent(index, animated = true) {
        const project = PROJECTS[index];
        if (!project) return;
        
        // Update text content
        if (this.categoryEl) this.categoryEl.textContent = project.category;
        if (this.titleEl) this.titleEl.textContent = project.title;
        if (this.descriptionEl) this.descriptionEl.textContent = project.description;
        if (this.iconEl) this.iconEl.textContent = project.icon;
        
        // Update tech pills
        if (this.techEl) {
            this.techEl.innerHTML = project.tech
                .map(tech => `<li>${tech}</li>`)
                .join('');
        }
        
        // Update dots
        this.dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

// Singleton instance
let morphCardInstance = null;

export function initMorphCard() {
    if (!morphCardInstance) {
        morphCardInstance = new MorphCard();
    }
    return morphCardInstance;
}

export { morphCardInstance };
