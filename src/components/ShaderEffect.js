import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ShaderEffect = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        const mount = mountRef.current;
        if (mount.firstChild) {
            mount.removeChild(mount.firstChild);
        }
        mount.appendChild(renderer.domElement);

        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float iTime;
                uniform vec2 iResolution;

                float noise(vec2 p) {
                    return sin(p.x) * sin(p.y);
                }

                float smoothNoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    float a = noise(i);
                    float b = noise(i + vec2(1.0, 0.0));
                    float c = noise(i + vec2(0.0, 1.0));
                    float d = noise(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }

                float fractalNoise(vec2 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 6; i++) {
                        value += amplitude * smoothNoise(p);
                        p *= 2.0;
                        amplitude *= 0.5;
                    }
                    return value;
                }

                void main() {
                    vec2 uv = gl_FragCoord.xy / iResolution.xy;
                    vec2 offset = uv - 0.5;

                    float angle = atan(offset.y, offset.x) + iTime * 0.1;
                    float radius = length(offset);

                    float stars = 0.0;
                    for (int i = 0; i < 5; i++) {
                        float r = fract(float(i) * 0.1 + iTime * 0.1);
                        float d = length(uv - vec2(r, r));
                        stars += 0.1 / d;
                    }

                    float noiseValue = fractalNoise(uv * 10.0 + iTime);
                    vec3 color = vec3(0.0);
                    color += vec3(0.2, 0.3, 0.4) * radius;
                    color += vec3(0.1, 0.9, 2.0) * stars;
                    color += vec3(0.5, 1.5, 0.5) * noiseValue;

                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        const plane = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(plane, material);
        scene.add(mesh);

        let lastTime = performance.now();

        const animate = () => {
            const currentTime = performance.now();
            const deltaTime = Math.min(currentTime - lastTime, 100);
            lastTime = currentTime;

            uniforms.iTime.value += 0.01;
            renderer.render(scene, camera);

            setTimeout(() => {
                requestAnimationFrame(animate);
            }, Math.max(0, 16 - deltaTime));
        };

        animate();

        return () => {
            renderer.dispose();
            material.dispose();
            plane.dispose();
            scene.remove(mesh);
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ShaderEffect;