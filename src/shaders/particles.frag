// Particle Fragment Shader
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying vec3 vColor;
varying float vAlpha;
varying float vDistanceToCamera;

void main() {
    // Create circular particle with soft edges
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Discard pixels outside the circle
    if (dist > 0.5) discard;
    
    // Soft edge falloff (glow effect)
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5); // Softer falloff
    
    // Core glow (brighter center)
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    
    // Base color from vertex shader
    vec3 color = vColor;
    
    // Add scroll-based color shift
    vec3 scrollTint = mix(uColorA, uColorB, uScroll);
    color = mix(color, scrollTint, 0.3);
    
    // Brighten the core
    color += vec3(core * 0.5);
    
    // Add subtle color variation based on time
    float colorPulse = sin(uTime * 2.0 + vDistanceToCamera * 0.1) * 0.1 + 0.9;
    color *= colorPulse;
    
    // Add cyan accent to bright particles
    float brightness = dot(color, vec3(0.299, 0.587, 0.114));
    color += uColorC * core * 0.3 * (1.0 - uScroll);
    
    // Final alpha
    float finalAlpha = alpha * vAlpha;
    
    // Additive blending works best with premultiplied alpha
    gl_FragColor = vec4(color * finalAlpha, finalAlpha);
}
