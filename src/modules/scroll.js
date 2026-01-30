import Lenis from 'lenis';

export let scrollInstance = null;

export function initScroll(onScrollCallback) {
    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    scrollInstance = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Bind scroll event
    lenis.on('scroll', ({ scroll, limit, velocity, progress }) => {
        if (onScrollCallback) {
            onScrollCallback({
                scrollY: scroll,
                limit,
                velocity,
                progress
            });
        }
    });

    return lenis;
}
