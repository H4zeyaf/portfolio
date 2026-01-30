import { animate, stagger, createTimeline } from 'animejs';

// Text reveal animations - character by character, word by word, line by line

export class TextAnimator {
    constructor() {
        this.observers = [];
        this.init();
    }
    
    init() {
        this.setupSplitTextObserver();
    }
    
    // Split text into characters for animation
    splitIntoChars(element, wrapperClass = 'char') {
        const text = element.textContent;
        element.innerHTML = '';
        
        const chars = text.split('').map(char => {
            const span = document.createElement('span');
            span.className = wrapperClass;
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(100%) rotateX(-90deg)';
            span.style.transformOrigin = 'center bottom';
            element.appendChild(span);
            return span;
        });
        
        return chars;
    }
    
    // Split text into words
    splitIntoWords(element, wrapperClass = 'word') {
        const text = element.textContent;
        element.innerHTML = '';
        
        const words = text.split(' ').map((word, index, arr) => {
            const span = document.createElement('span');
            span.className = wrapperClass;
            span.textContent = word;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(40px)';
            span.style.marginRight = '0.3em';
            element.appendChild(span);
            
            // Add space after word (except last)
            if (index < arr.length - 1) {
                const space = document.createElement('span');
                space.textContent = ' ';
                element.appendChild(space);
            }
            
            return span;
        });
        
        return words;
    }
    
    // Split text into lines (for block elements)
    splitIntoLines(element) {
        const text = element.innerHTML;
        const lines = text.split('<br>').map(line => line.trim());
        element.innerHTML = '';
        
        const lineElements = lines.map((line, index) => {
            const div = document.createElement('div');
            div.className = 'line-wrapper';
            div.style.overflow = 'hidden';
            div.style.display = 'block';
            
            const inner = document.createElement('span');
            inner.className = 'line-inner';
            inner.innerHTML = line;
            inner.style.display = 'block';
            inner.style.transform = 'translateY(100%)';
            
            div.appendChild(inner);
            element.appendChild(div);
            
            // Add line break
            if (index < lines.length - 1) {
                element.appendChild(document.createElement('br'));
            }
            
            return inner;
        });
        
        return lineElements;
    }
    
    // Animate characters with wave effect
    animateChars(element, options = {}) {
        const chars = this.splitIntoChars(element, options.className || 'char');
        
        animate(chars, {
            opacity: [0, 1],
            translateY: ['100%', '0%'],
            rotateX: [-90, 0],
            duration: options.duration || 800,
            delay: stagger(options.stagger || 30, {
                start: options.delay || 0,
                from: options.from || 'start'
            }),
            ease: options.ease || 'outExpo',
        });
        
        return chars;
    }
    
    // Animate words
    animateWords(element, options = {}) {
        const words = this.splitIntoWords(element, options.className || 'word');
        
        animate(words, {
            opacity: [0, 1],
            translateY: [40, 0],
            duration: options.duration || 1000,
            delay: stagger(options.stagger || 80, {
                start: options.delay || 0
            }),
            ease: options.ease || 'outExpo',
        });
        
        return words;
    }
    
    // Animate lines
    animateLines(element, options = {}) {
        const lines = this.splitIntoLines(element);
        
        animate(lines, {
            translateY: ['100%', '0%'],
            duration: options.duration || 1200,
            delay: stagger(options.stagger || 150, {
                start: options.delay || 0
            }),
            ease: options.ease || 'outExpo',
        });
        
        return lines;
    }
    
    // Scramble text effect (matrix style)
    scrambleText(element, finalText, options = {}) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const duration = options.duration || 1500;
        const frameRate = 30;
        const totalFrames = (duration / 1000) * frameRate;
        let frame = 0;
        
        const interval = setInterval(() => {
            let output = '';
            const progress = frame / totalFrames;
            
            for (let i = 0; i < finalText.length; i++) {
                if (finalText[i] === ' ') {
                    output += ' ';
                } else if (i < finalText.length * progress) {
                    output += finalText[i];
                } else {
                    output += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            element.textContent = output;
            frame++;
            
            if (frame > totalFrames) {
                clearInterval(interval);
                element.textContent = finalText;
                if (options.onComplete) options.onComplete();
            }
        }, 1000 / frameRate);
    }
    
    // Typewriter effect
    typewriter(element, options = {}) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        let index = 0;
        const speed = options.speed || 50;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed + (Math.random() * 30));
            } else if (options.onComplete) {
                options.onComplete();
            }
        };
        
        setTimeout(type, options.delay || 0);
    }
    
    // Setup observer for split text elements
    setupSplitTextObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        // Observe elements with data-split attribute
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    
                    const type = entry.target.dataset.split || 'chars';
                    const options = {
                        duration: parseInt(entry.target.dataset.duration) || 800,
                        stagger: parseInt(entry.target.dataset.stagger) || 30,
                        delay: parseInt(entry.target.dataset.delay) || 0,
                        ease: entry.target.dataset.ease || 'outExpo'
                    };
                    
                    switch(type) {
                        case 'chars':
                            this.animateChars(entry.target, options);
                            break;
                        case 'words':
                            this.animateWords(entry.target, options);
                            break;
                        case 'lines':
                            this.animateLines(entry.target, options);
                            break;
                        case 'scramble':
                            const finalText = entry.target.textContent;
                            this.scrambleText(entry.target, finalText, options);
                            break;
                        case 'typewriter':
                            this.typewriter(entry.target, options);
                            break;
                    }
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('[data-split]').forEach(el => {
            observer.observe(el);
        });
        
        this.observers.push(observer);
    }
    
    // Refresh observers (call after DOM changes)
    refresh() {
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];
        this.setupSplitTextObserver();
    }
    
    destroy() {
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];
    }
}

// Parallax scroll effects
export class ParallaxController {
    constructor() {
        this.elements = [];
        this.ticking = false;
    }
    
    add(element, options = {}) {
        this.elements.push({
            element,
            speed: options.speed || 0.5,
            direction: options.direction || 'vertical', // 'vertical' or 'horizontal'
            reverse: options.reverse || false,
            offset: options.offset || 0
        });
    }
    
    update(scrollY) {
        if (this.ticking) return;
        this.ticking = true;
        
        requestAnimationFrame(() => {
            this.elements.forEach(item => {
                const rect = item.element.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;
                const viewportCenter = window.innerHeight / 2;
                const distance = elementCenter - viewportCenter;
                
                let translate = distance * item.speed * (item.reverse ? -1 : 1);
                translate += item.offset;
                
                if (item.direction === 'horizontal') {
                    item.element.style.transform = `translateX(${translate}px)`;
                } else {
                    item.element.style.transform = `translateY(${translate}px)`;
                }
            });
            
            this.ticking = false;
        });
    }
    
    clear() {
        this.elements = [];
    }
}

// Counter animation
export function animateCounter(element, target, options = {}) {
    const duration = options.duration || 2000;
    const suffix = options.suffix || '';
    const prefix = options.prefix || '';
    
    animate(element, {
        innerHTML: [0, target],
        duration: duration,
        delay: options.delay || 0,
        ease: options.ease || 'outExpo',
        modifiers: {
            innerHTML: (value) => {
                return prefix + Math.round(value) + suffix;
            }
        }
    });
}

// Export singleton instances
let textAnimatorInstance = null;
let parallaxInstance = null;

export function initTextAnimations() {
    if (!textAnimatorInstance) {
        textAnimatorInstance = new TextAnimator();
    }
    return textAnimatorInstance;
}

export function initParallax() {
    if (!parallaxInstance) {
        parallaxInstance = new ParallaxController();
    }
    return parallaxInstance;
}

export { textAnimatorInstance, parallaxInstance };
