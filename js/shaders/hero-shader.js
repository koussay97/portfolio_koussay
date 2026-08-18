export const vertexShader = `
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
        // Pulse effect moving along the Y axis over time
        float pulse = sin(vPosition.y * 3.0 + time * 2.5) * 0.5 + 0.5;
        // Additive intensity multiplier
        float intensity = 0.4 + pulse * 0.8;
        gl_FragColor = vec4(color * intensity, intensity);
    }
`;
