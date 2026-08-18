import { vertexShader, fragmentShader } from './shaders/hero-shader.js';

export class ThreeScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 8;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.coreGroup = new THREE.Group();
        this.scene.add(this.coreGroup);

        this.initObjects();
        this.initEvents();
        this.animate();
    }

    initObjects() {
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xF59E0B) } // Electric Amber
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            wireframe: true
        });

        const octGeom = new THREE.OctahedronGeometry(1.5, 0);
        const octEdges = new THREE.EdgesGeometry(octGeom);
        this.octMesh = new THREE.LineSegments(octEdges, this.shaderMaterial);
        this.coreGroup.add(this.octMesh);

        const ringConfigs = [
            { radius: 2.4, tube: 0.02, rotation: [Math.PI/2, 0, 0] },
            { radius: 3.2, tube: 0.015, rotation: [Math.PI/3, Math.PI/4, 0] },
            { radius: 4.0, tube: 0.03, rotation: [0, Math.PI/2, Math.PI/6] }
        ];

        ringConfigs.forEach(conf => {
            const torusGeom = new THREE.TorusGeometry(conf.radius, conf.tube, 16, 100);
            const torusMesh = new THREE.Mesh(torusGeom, this.shaderMaterial);
            torusMesh.rotation.set(...conf.rotation);
            this.coreGroup.add(torusMesh);
        });
    }

    initEvents() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        const clock = new THREE.Clock();
        const loop = () => {
            requestAnimationFrame(loop);
            const time = clock.getElapsedTime();

            this.shaderMaterial.uniforms.time.value = time;
            this.coreGroup.rotation.y += 0.002;
            this.coreGroup.rotation.z += 0.001;

            this.targetRotationY = this.mouseX * 0.4;
            this.targetRotationX = -this.mouseY * 0.4;
            this.coreGroup.rotation.y += (this.targetRotationY - this.coreGroup.rotation.y) * 0.05;
            this.coreGroup.rotation.x += (this.targetRotationX - this.coreGroup.rotation.x) * 0.05;

            this.octMesh.rotation.y = time * 0.2;
            this.octMesh.rotation.x = time * 0.1;

            this.renderer.render(this.scene, this.camera);
        };
        loop();
    }
}
