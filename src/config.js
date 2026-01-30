/**
 * Centralized configuration constants for the portfolio
 * Consolidates magic numbers and settings from across the codebase
 */

// ===========================================
// Animation Timing Constants
// ===========================================
export const ANIMATION = {
    DURATION_SHORT: 300,
    DURATION_MEDIUM: 600,
    DURATION_LONG: 1200,
    DURATION_EXTRA_LONG: 2000,
    STAGGER_SMALL: 30,
    STAGGER_MEDIUM: 50,
    STAGGER_LARGE: 100,
    EASE_OUT_EXPO: 'outExpo',
    EASE_IN_QUAD: 'inQuad',
};

// ===========================================
// Scroll Settings
// ===========================================
export const SCROLL = {
    OFFSET: 80,                    // Offset for fixed nav when scrolling to sections
    NAV_SHOW_THRESHOLD: 0.5,       // Show nav after scrolling past 50% of hero
    LENIS_DURATION: 1.2,           // Lenis smooth scroll duration
    WHEEL_MULTIPLIER: 1,
    TOUCH_MULTIPLIER: 2,
};

// ===========================================
// Cursor Settings
// ===========================================
export const CURSOR = {
    TRAIL_LENGTH: 8,
    MAGNET_RADIUS: 100,
    EASE: 0.15,
    SIZE: 40,
    DOT_SIZE: 6,
};

// ===========================================
// WebGL / Three.js Settings
// ===========================================
export const WEBGL = {
    PARTICLE_COUNT: 10000,
    CAMERA_Z: 50,
    CAMERA_FOV: 60,
    FOG_DENSITY: 0.008,
    MOUSE_EASE: 0.08,
    PIXEL_RATIO_MAX: 2,
};

// ===========================================
// Physics Constants (for particle simulation)
// ===========================================
export const PHYSICS = {
    SPRING_STRENGTH: 0.008,        // Very low - particles are "lazy"
    FRICTION: 0.88,                // High drag - kills bounce
    REPULSION_STRENGTH: 800,       // Strong initial push from mouse
    REPULSION_FALLOFF: 0.1,        // Softness of repulsion edge
    MAX_VELOCITY: 2.0,             // Clamp velocity to prevent explosion
    REPULSION_RADIUS: 15.0,        // Mouse repulsion radius
};

// ===========================================
// Color Palette
// ===========================================
export const COLORS = {
    ACCENT: '#00d4ff',
    ACCENT_RGB: '0, 212, 255',
    PURPLE: '#4a0080',
    DEEP_BLUE: '#0a0a2e',
    MIDNIGHT_BLUE: '#1a1a4e',
    DEEP_PURPLE: '#2a0050',
    PINK: '#ff006e',
    BACKGROUND: '#000000',
    TEXT: 'rgba(255, 255, 255, 0.95)',
    TEXT_DIM: 'rgba(255, 255, 255, 0.6)',
};

// ===========================================
// Z-Index Layers
// ===========================================
export const Z_INDEX = {
    BACKGROUND: -1,
    FLOATING_SHAPES: 0,
    CONTENT: 1,
    NAV_PROGRESS: 5,
    CARD: 10,
    NAV: 100,
    CURSOR_TRAIL: 9999,
    OVERLAY: 9998,
    PROGRESS_BAR: 9999,
    CURSOR: 10000,
    CURSOR_DOT: 10001,
};

// ===========================================
// Intersection Observer Thresholds
// ===========================================
export const OBSERVER = {
    REVEAL_THRESHOLD: 0.1,
    REVEAL_ROOT_MARGIN: '0px 0px -50px 0px',
    SECTION_ROOT_MARGIN: '-40% 0px -40% 0px',
    MORPH_ROOT_MARGIN: '-45% 0px -45% 0px',
};

// ===========================================
// Breakpoints
// ===========================================
export const BREAKPOINTS = {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1400,
};

// Default export for convenience
export default {
    ANIMATION,
    SCROLL,
    CURSOR,
    WEBGL,
    PHYSICS,
    COLORS,
    Z_INDEX,
    OBSERVER,
    BREAKPOINTS,
};
