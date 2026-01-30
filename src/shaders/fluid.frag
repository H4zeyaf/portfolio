precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uScroll;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying vec2 vUv;

// ============================================
// Simplex 3D Noise by Ian McEwan, Ashima Arts
// ============================================
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ============================================
// Fractal Brownian Motion (FBM) for layered noise
// ============================================
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // 5 octaves of noise for rich detail
    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// ============================================
// Domain Warping for fluid effect
// ============================================
float warpedNoise(vec2 uv, float time) {
    vec3 p = vec3(uv * 3.0, time * 0.15);
    
    // First layer of warping
    float warp1 = fbm(p);
    
    // Second layer using first warp
    vec3 q = vec3(
        fbm(p + vec3(1.7, 9.2, 0.0)),
        fbm(p + vec3(8.3, 2.8, 0.0)),
        0.0
    );
    
    // Third layer for more complexity
    vec3 r = vec3(
        fbm(p + 4.0 * q + vec3(1.2, 3.4, time * 0.1)),
        fbm(p + 4.0 * q + vec3(4.7, 2.6, time * 0.15)),
        0.0
    );
    
    return fbm(p + 4.0 * r);
}

// ============================================
// Mouse repulsor effect
// ============================================
float mouseInfluence(vec2 uv, vec2 mouse) {
    float dist = distance(uv, mouse);
    float radius = 0.25;
    float strength = 0.3;
    return smoothstep(radius, 0.0, dist) * strength;
}

void main() {
    vec2 uv = vUv;
    float aspectRatio = uResolution.x / uResolution.y;
    
    // ==========================================
    // SCROLL-BASED DISTORTION
    // ==========================================
    float scrollFactor = uScroll;
    
    // Scroll affects the noise scale (zooms in as you scroll)
    float scrollZoom = 1.0 + scrollFactor * 0.5;
    
    // Scroll-based UV rotation (subtle twist effect)
    float scrollAngle = scrollFactor * 0.3;
    vec2 centeredUV = uv - 0.5;
    vec2 rotatedUV;
    rotatedUV.x = centeredUV.x * cos(scrollAngle) - centeredUV.y * sin(scrollAngle);
    rotatedUV.y = centeredUV.x * sin(scrollAngle) + centeredUV.y * cos(scrollAngle);
    rotatedUV += 0.5;
    
    // Correct for aspect ratio
    vec2 uvCorrected = rotatedUV;
    uvCorrected.x *= aspectRatio;
    
    // Mouse repulsor - distort UV based on mouse position
    vec2 mouseUV = uMouse;
    mouseUV.x *= aspectRatio;
    
    vec2 toMouse = uvCorrected - mouseUV;
    float mouseDist = length(toMouse);
    float mouseEffect = smoothstep(0.4, 0.0, mouseDist);
    
    // Push UVs away from mouse (ripple/repulsor) - intensity increases with scroll
    float repulsorStrength = 0.08 + scrollFactor * 0.04;
    vec2 distortedUV = rotatedUV + normalize(toMouse) * mouseEffect * repulsorStrength;
    
    // ==========================================
    // TIME & NOISE CALCULATION
    // ==========================================
    
    // Time speeds up slightly as you scroll deeper
    float time = uTime * (0.5 + scrollFactor * 0.3);
    
    // Scroll affects noise frequency (more turbulent as you scroll)
    float noiseScale = scrollZoom;
    
    // Main fluid noise with domain warping
    float noise1 = warpedNoise(distortedUV * noiseScale, time);
    float noise2 = warpedNoise(distortedUV * noiseScale * 1.5 + 0.5, time * 0.8);
    float noise3 = warpedNoise(distortedUV * noiseScale * 0.8 - 0.3, time * 1.2);
    
    // Combine noise layers - scroll adds more contrast
    float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    combinedNoise = combinedNoise * 0.5 + 0.5; // Normalize to 0-1
    
    // Add scroll-based noise distortion (more intense patterns at bottom)
    float scrollNoise = snoise(vec3(distortedUV * 2.0, time * 0.2 + scrollFactor * 3.0));
    combinedNoise = mix(combinedNoise, combinedNoise + scrollNoise * 0.2, scrollFactor * 0.5);
    combinedNoise = clamp(combinedNoise, 0.0, 1.0);
    
    // Mouse glow effect - brighter as you scroll
    float mouseGlow = mouseEffect * (0.5 + scrollFactor * 0.3);
    
    // ==========================================
    // COLOR SHIFTING (Deep Blue -> Neon Purple)
    // ==========================================
    
    // Smooth easing for color transition
    float colorProgress = smoothstep(0.0, 1.0, scrollFactor);
    
    // Create color gradient based on noise and scroll
    vec3 color1 = mix(uColorA, uColorB, combinedNoise);
    vec3 color2 = mix(uColorC, uColorD, combinedNoise);
    vec3 baseColor = mix(color1, color2, colorProgress);
    
    // Add luminance variation from noise - increases with scroll for more dramatic effect
    float luminance = combinedNoise * (0.6 + scrollFactor * 0.2) + 0.4;
    baseColor *= luminance;
    
    // Scroll-based saturation boost (colors get more vibrant as you scroll)
    float saturationBoost = 1.0 + scrollFactor * 0.3;
    vec3 gray = vec3(dot(baseColor, vec3(0.299, 0.587, 0.114)));
    baseColor = mix(gray, baseColor, saturationBoost);
    
    // Add highlights that shift with scroll
    float highlight = pow(combinedNoise, 3.0) * (0.4 + scrollFactor * 0.2);
    vec3 highlightColor = mix(uColorD, uColorC, colorProgress);
    baseColor += vec3(highlight) * highlightColor;
    
    // Mouse interaction glow - color shifts with scroll
    vec3 glowColor = mix(uColorD, uColorC, colorProgress);
    baseColor += glowColor * mouseGlow * 1.5;
    
    // ==========================================
    // POST-PROCESSING EFFECTS
    // ==========================================
    
    // Vignette - tightens as you scroll for more focus
    float vignetteRadius = 1.4 - scrollFactor * 0.2;
    float vignette = 1.0 - smoothstep(0.4, vignetteRadius, length(uv - 0.5) * 1.5);
    baseColor *= vignette * 0.3 + 0.7;
    
    // Chromatic aberration increases with scroll (RGB shift)
    float chromaStrength = scrollFactor * 0.003;
    vec2 chromaDir = normalize(uv - 0.5);
    float rChannel = combinedNoise; // Red stays
    float bShift = snoise(vec3(distortedUV + chromaDir * chromaStrength, time));
    baseColor.b += bShift * chromaStrength * 50.0 * scrollFactor;
    
    // Film grain - slightly more visible as scroll increases
    float grainIntensity = 0.03 + scrollFactor * 0.02;
    float grain = (fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * grainIntensity;
    baseColor += grain;
    
    // Subtle bloom on bright areas (increases with scroll)
    float bloomThreshold = 0.7 - scrollFactor * 0.1;
    float bloom = smoothstep(bloomThreshold, 1.0, luminance) * scrollFactor * 0.15;
    baseColor += highlightColor * bloom;
    
    gl_FragColor = vec4(baseColor, 1.0);
}
