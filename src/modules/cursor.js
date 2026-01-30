import { animate, createTimeline } from 'animejs';

class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.trail = [];
        this.trailLength = 8;
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.isHovering = false;
        this.isClicking = false;
        this.magneticElements = [];
        
        this.init();
    }
    
    init() {
        // Check for touch device
        if (window.matchMedia('(pointer: coarse)').matches) {
            return; // Don't show custom cursor on touch devices
        }
        
        this.createCursorElements();
        this.addEventListeners();
        this.animate();
        this.findMagneticElements();
    }
    
    createCursorElements() {
        // Main cursor ring
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        
        // Center dot
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'cursor-dot';
        document.body.appendChild(this.cursorDot);
        
        // Trail elements
        for (let i = 0; i < this.trailLength; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = 1 - (i / this.trailLength);
            document.body.appendChild(trail);
            this.trail.push({
                element: trail,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }
        
        // Hide default cursor
        document.body.style.cursor = 'none';
    }
    
    addEventListeners() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, { passive: true });
        
        // Mouse down/up for click effect
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            this.updateCursorState();
        });
        
        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            this.updateCursorState();
        });
        
        // Hover effects
        const hoverables = 'a, button, [data-cursor-hover], .morph-card, .progress-dot, .contact-link';
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches(hoverables) || e.target.closest(hoverables)) {
                this.isHovering = true;
                this.updateCursorState();
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.matches(hoverables) || e.target.closest(hoverables)) {
                this.isHovering = false;
                this.updateCursorState();
            }
        });
        
        // Magnetic effect on specific elements
        document.addEventListener('mousemove', (e) => {
            this.handleMagneticEffect(e);
        }, { passive: true });
    }
    
    findMagneticElements() {
        // Find elements with magnetic data attribute
        this.magneticElements = document.querySelectorAll('[data-magnetic]');
    }
    
    handleMagneticEffect(e) {
        this.magneticElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const magnetRadius = 100;
            
            if (distance < magnetRadius) {
                const strength = 1 - (distance / magnetRadius);
                const moveX = distanceX * strength * 0.3;
                const moveY = distanceY * strength * 0.3;
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            } else {
                el.style.transform = '';
            }
        });
    }
    
    updateCursorState() {
        if (!this.cursor) return;
        
        if (this.isClicking) {
            this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
            this.cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        } else if (this.isHovering) {
            this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            this.cursorDot.style.transform = 'translate(-50%, -50%) scale(0)';
        } else {
            this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }
    
    animate() {
        if (!this.cursor) return;
        
        // Smooth cursor follow
        const ease = 0.15;
        this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * ease;
        this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * ease;
        
        // Update main cursor
        this.cursor.style.left = this.cursorPos.x + 'px';
        this.cursor.style.top = this.cursorPos.y + 'px';
        
        // Update dot (faster follow)
        this.cursorDot.style.left = this.mouse.x + 'px';
        this.cursorDot.style.top = this.mouse.y + 'px';
        
        // Update trail
        let prevX = this.cursorPos.x;
        let prevY = this.cursorPos.y;
        
        this.trail.forEach((trail, index) => {
            const trailEase = 0.15 - (index * 0.01);
            trail.x += (prevX - trail.x) * trailEase;
            trail.y += (prevY - trail.y) * trailEase;
            
            trail.element.style.left = trail.x + 'px';
            trail.element.style.top = trail.y + 'px';
            
            prevX = trail.x;
            prevY = trail.y;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    // Refresh magnetic elements (call after DOM changes)
    refresh() {
        this.findMagneticElements();
    }
    
    destroy() {
        if (this.cursor) {
            this.cursor.remove();
            this.cursorDot.remove();
            this.trail.forEach(t => t.element.remove());
            document.body.style.cursor = '';
        }
    }
}

// Singleton
let cursorInstance = null;

export function initCursor() {
    if (!cursorInstance) {
        cursorInstance = new CustomCursor();
    }
    return cursorInstance;
}

export { cursorInstance };
