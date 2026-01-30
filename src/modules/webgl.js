import * as THREE from 'three';

// Import shaders as raw strings
import vertexShader from '../shaders/terrain.vert?raw';
import fragmentShader from '../shaders/terrain.frag?raw';

class WebGLCanvas {
    constructor() {
        this.container = document.body;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Scroll state
        this.scrollProgress = 0;
        this.targetScrollProgress = 0;

        // Store bound references for proper cleanup
        this.boundOnResize = this.onResize.bind(this);
        this.boundAnimate = this.animate.bind(this);
        this.animationFrameId = null;

        this.init();
        this.createFullscreenQuad();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Orthographic camera for fullscreen quad
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0x000000, 1);

        // Insert canvas as background
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.zIndex = '-1';
        this.renderer.domElement.style.pointerEvents = 'none';

        this.container.prepend(this.renderer.domElement);

        // Clock for animation
        this.clock = new THREE.Clock();
    }

    createFullscreenQuad() {
        // Fullscreen triangle (more efficient than quad)
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            -1, -1, 0,
             3, -1, 0,
            -1,  3, 0,
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Shader material with raymarching terrain
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(
                    this.width * Math.min(window.devicePixelRatio, 1.5),
                    this.height * Math.min(window.devicePixelRatio, 1.5)
                )},
                uScrollProgress: { value: 0 },
            },
            depthWrite: false,
            depthTest: false,
        });

        // Create mesh
        this.quad = new THREE.Mesh(geometry, this.material);
        this.quad.frustumCulled = false;
        this.scene.add(this.quad);
    }

    addEventListeners() {
        window.addEventListener('resize', this.boundOnResize);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.renderer.setSize(this.width, this.height);
        
        const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        this.renderer.setPixelRatio(pixelRatio);

        this.material.uniforms.uResolution.value.set(
            this.width * pixelRatio,
            this.height * pixelRatio
        );
    }

    setScrollProgress(progress, scrollY = 0) {
        this.targetScrollProgress = progress;
    }

    setScrollVelocity(velocity) {
        // Not used
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);

        const elapsedTime = this.clock.getElapsedTime();

        // Smooth scroll interpolation
        this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.1;

        // Update uniforms
        this.material.uniforms.uTime.value = elapsedTime;
        this.material.uniforms.uScrollProgress.value = this.scrollProgress;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        window.removeEventListener('resize', this.boundOnResize);

        this.renderer.dispose();
        this.material.dispose();
        this.quad.geometry.dispose();

        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}

// Export singleton instance
let webglInstance = null;

export function initWebGL() {
    if (!webglInstance) {
        webglInstance = new WebGLCanvas();
    }
    return webglInstance;
}

export { webglInstance };
