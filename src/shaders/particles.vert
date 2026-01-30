// Particle Vertex Shader - CPU physics, GPU rendering
uniform float uTime;
uniform vec3 uMouse;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uWaveOffset;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uRepulsionRadius;
uniform float uRepulsionStrength;

attribute vec3 aRandomOffset;
attribute float aSize;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;
varying float vDistanceToCamera;

void main() {
    // ==========================================
    // CPU-BASED PHYSICS
    // Position is already updated by JavaScript spring physics
    // We just add subtle organic drift for visual polish
    // ==========================================
    vec3 pos = position;  // Already displaced by CPU physics
    
    // ==========================================
    // SUBTLE ORGANIC DRIFT (visual polish only)
    // Small oscillation to make particles feel alive
    // ==========================================
    float driftSpeed = 0.15;
    float driftAmount = 0.8;  // Reduced - main motion is from CPU physics
    
    pos.x += sin(uTime * driftSpeed + aRandomOffset.x) * driftAmount;
    pos.y += cos(uTime * driftSpeed * 0.8 + aRandomOffset.y) * driftAmount;
    pos.z += sin(uTime * driftSpeed * 0.6 + aRandomOffset.z) * driftAmount * 0.3;
    
    // ==========================================
    // FINAL POSITION & SIZE
    // ==========================================
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance to camera for size attenuation
    vDistanceToCamera = -mvPosition.z;
    
    // Point size with perspective attenuation
    float baseSize = 2.0 * uPixelRatio;
    float sizeAttenuation = 1.0 / vDistanceToCamera;
    gl_PointSize = baseSize * aSize * sizeAttenuation * 150.0;
    gl_PointSize = clamp(gl_PointSize, 0.5, 30.0);
    
    // ==========================================
    // COLOR & ALPHA PASS TO FRAGMENT
    // ==========================================
    float scrollEffect = uScroll;
    
    // Color shifts based on scroll (blue to purple)
    vec3 scrollColor = mix(aColor, aColor * vec3(1.2, 0.8, 1.5), scrollEffect);
    
    // Mouse proximity brightens particles
    float distToMouse = length(pos - uMouse);
    float mouseBrightness = 1.0 + (1.0 - smoothstep(0.0, uRepulsionRadius * 1.5, distToMouse)) * 0.8;
    vColor = scrollColor * mouseBrightness;
    
    // Alpha based on distance (fade out far particles)
    vAlpha = smoothstep(80.0, 20.0, vDistanceToCamera);
    
    // Extra alpha for particles near mouse
    vAlpha += (1.0 - smoothstep(0.0, uRepulsionRadius, distToMouse)) * 0.3;
    vAlpha = clamp(vAlpha, 0.0, 1.0);
}
