precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScrollProgress;

// ============================================
// Optimized 3D Gradient Noise
// ============================================

vec3 hash(vec3 p) {
    p = vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(
            mix(dot(hash(i), f),
                dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
            mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x),
            u.y
        ),
        mix(
            mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
            mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x),
            u.y
        ),
        u.z
    );
}

// ============================================
// Terrain
// ============================================

float Height(vec3 p) {
    float v = noise(vec3(p.xz * 10.0, uTime * 0.125));
    v = sin(v * 20.0) * 0.5 + 0.5;
    float v2 = 0.8 - (v - 0.8) * 1.5;
    v = min(v, v2);
    return v * 0.025;
}

float sdf(vec3 p) {
    return p.y - Height(p);
}

// ============================================
// Raymarching (optimized: fewer iterations)
// ============================================

float March(vec3 ro, vec3 rd) {
    float dist = 0.0;
    
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + dist * rd;
        float d = sdf(p);
        if (d < 0.002) return dist;
        dist += d * 0.4;
        if (dist > 10.0) break;
    }
    
    return -1.0;
}

// ============================================
// Lighting (optimized: simpler shadows)
// ============================================

vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));

float Shadow(vec3 ro) {
    float dist = 0.01;
    float shadow = 1.0;
    
    for (int i = 0; i < 8; i++) {
        float d = sdf(ro + dist * lightDir);
        if (d < 0.001) return 0.2;
        shadow = min(shadow, 8.0 * d / dist);
        dist += d * 0.5;
    }
    
    return clamp(shadow, 0.2, 1.0);
}

// ============================================
// Render
// ============================================

vec3 Render(vec3 ro, vec3 rd) {
    float d = March(ro, rd);
    if (d < 0.0) return vec3(0.0);
    
    vec3 p = ro + d * rd;
    
    // Simple normal from height difference
    vec2 e = vec2(0.002, 0.0);
    vec3 nor = normalize(vec3(
        Height(p - e.xyy) - Height(p + e.xyy),
        0.004,
        Height(p - e.yyx) - Height(p + e.yyx)
    ));
    
    // Basic diffuse lighting
    float diff = max(dot(nor, lightDir), 0.0);
    float shadow = Shadow(p);
    
    // Simple color based on height
    float h = Height(p) * 40.0;
    vec3 col = mix(vec3(0.02), vec3(1.0), smoothstep(0.7, 0.85, h));
    
    col *= (0.3 + 0.7 * diff * shadow);
    col = pow(col, vec3(0.4545));
    
    return col;
}

// ============================================
// Camera Path
// ============================================

vec3 path(float t) {
    float s = 0.075;
    vec3 p = vec3(4.0 * cos(s * t), 0.0, 4.0 * sin(s * t));
    p.xz += 0.5 * normalize(p.xz) * sin(s * 4.0 * t);
    p.y += 1.2; // Lower for closer zoom
    return p;
}

// ============================================
// Main
// ============================================

void main() {
    // Center UV coordinates
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / uResolution.x;
    uv -= vec2(0.5 * uResolution.x / uResolution.x, 0.5 * uResolution.y / uResolution.x);
    
    float t = uTime * 0.125 + uScrollProgress * 2.0;
    
    vec3 ro = path(t);
    
    // Look straight down at terrain below camera
    vec3 target = ro - vec3(0.0, 2.0, 0.0);
    
    vec3 fwd = normalize(target - ro);
    vec3 right = normalize(cross(fwd, vec3(0.0, 0.0, 1.0))); // Use Z-up for top-down
    vec3 up = cross(right, fwd);
    
    float fl = 1.8; // Higher focal length = more zoom
    vec3 rd = normalize(uv.x * right + uv.y * up + fl * fwd);
    
    gl_FragColor = vec4(Render(ro, rd), 1.0);
}
