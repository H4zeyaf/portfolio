import './style.css';
import { initWebGL } from './modules/webgl.js';
import { initScroll } from './modules/scroll.js';
import { initUI } from './modules/ui.js';

// Initialize WebGL background
const webgl = initWebGL();

// Initialize Lenis smooth scroll and connect to WebGL
const scroll = initScroll(({ progress, velocity, scrollY }) => {
    // Update WebGL shader uniform with scroll progress and position
    webgl.setScrollProgress(progress, scrollY);

    // Toggle scroll indicator visibility
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        if (scrollY > 50) {
            indicator.classList.add('hidden');
        } else {
            indicator.classList.remove('hidden');
        }
    }
});

// Portfolio HTML Structure
document.querySelector('#app').innerHTML = `
  <main class="content">
    <!-- Hero Section -->
    <section class="hero" id="hero">
      <h1 class="hero-title" data-animate="title">Creative Technologist</h1>
      <p class="hero-subtitle" data-animate="subtitle">Full-Stack Developer • Systems Engineer • Hardware Architect</p>
      <div class="scroll-indicator" data-animate="scroll">
        <span>Scroll to explore</span>
        <div class="scroll-line"></div>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="projects" id="projects">
      <header class="section-header">
        <h2 class="section-title" data-animate="section">Selected Works</h2>
        <p class="section-subtitle" data-animate="section">Projects that define my craft</p>
      </header>

      <div class="projects-grid">
        <!-- Project A: MHB Automobiles -->
        <article class="project-card" data-animate="card">
          <div class="card-content">
            <span class="card-category">Web Development</span>
            <h3 class="card-title">MHB Automobiles</h3>
            <p class="card-description">
              Modernizing dealership management with seamless AJAX filtering and real-time comparisons.
            </p>
            <ul class="card-tech">
              <li>PHP</li>
              <li>JavaScript</li>
              <li>AJAX</li>
              <li>MySQL</li>
              <li>Anime.js</li>
            </ul>
          </div>
          <div class="card-visual">
            <div class="card-icon"></div>
          </div>
        </article>

        <!-- Project B: Multi-GPU LLM Rig -->
        <article class="project-card" data-animate="card">
          <div class="card-content">
            <span class="card-category">Hardware Architecture</span>
            <h3 class="card-title">Multi-GPU Local LLM Rig</h3>
            <p class="card-description">
              Architecting a dual-GPU workstation for high-performance local Large Language Model inference.
            </p>
            <ul class="card-tech">
              <li>RTX 5080</li>
              <li>RTX 3080</li>
              <li>Linux</li>
              <li>CUDA</li>
              <li>Lian Li O11D</li>
            </ul>
          </div>
          <div class="card-visual">
            <div class="card-icon"></div>
          </div>
        </article>

        <!-- Project C: School Management System -->
        <article class="project-card" data-animate="card">
          <div class="card-content">
            <span class="card-category">Software Engineering</span>
            <h3 class="card-title">C++ School Management</h3>
            <p class="card-description">
              Optimizing data structures and file I/O for efficient student record management.
            </p>
            <ul class="card-tech">
              <li>C++</li>
              <li>OOP</li>
              <li>Memory Management</li>
              <li>File I/O</li>
            </ul>
          </div>
          <div class="card-visual">
            <div class="card-icon"></div>
          </div>
        </article>

        <!-- Project D: Arch + Hyprland Workflow -->
        <article class="project-card" data-animate="card">
          <div class="card-content">
            <span class="card-category">DevOps / Customization</span>
            <h3 class="card-title">Arch + Hyprland Workflow</h3>
            <p class="card-description">
              Extreme workflow optimization using tiling window managers and custom automation scripts.
            </p>
            <ul class="card-tech">
              <li>Arch Linux</li>
              <li>Bash</li>
              <li>Hyprland</li>
              <li>Wayland</li>
            </ul>
          </div>
          <div class="card-visual">
            <div class="card-icon"></div>
          </div>
        </article>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
      <h2 class="section-title" data-animate="section">Let's Connect</h2>
      <p class="contact-text" data-animate="section">
        Currently studying Computer Science at EMSI, Tangier.<br>
        Open to opportunities and collaborations.
      </p>
      <div class="contact-links" data-animate="section">
        <a href="#" class="contact-link">GitHub</a>
        <a href="#" class="contact-link">LinkedIn</a>
        <a href="mailto:contact@example.com" class="contact-link">Email</a>
      </div>
    </section>
  </main>
`;

// Initialize UI animations (Anime.js) after DOM is ready
const ui = initUI();

console.log('🚀 Portfolio initialized with Lenis + Anime.js');
