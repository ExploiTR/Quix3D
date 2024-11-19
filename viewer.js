let scene, camera, renderer, object, controls, animationId;

function resizeSTLViewer() {
    const viewer = document.getElementById("stlViewer");
    const canvas = viewer.querySelector("canvas");
    if (canvas) {
        const height = canvas.clientHeight;
        viewer.style.width = height + "px";
        if (renderer) {
            renderer.setSize(height, height);
        }
    }
    viewer.style.width = viewer.clientHeight + 'px';
}

function displaySTL(geometry) {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    if (!scene) {
        scene = new THREE.Scene();
        const aspect = 1;//window.innerWidth / window.innerHeight;

       // scene.background = new THREE.Color(0x000000);
       // scene.fog = new THREE.Fog(0x000000, 100, 200);

       const frustumSize = 200;  // Adjust this value to control initial zoom
       camera = new THREE.OrthographicCamera(
           -frustumSize,
           frustumSize,
           frustumSize,
           -frustumSize,
           0.1,
           2000
       );

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            precision: "highp",
            alpha: true,
            stencil: false
        });

        const stlViewer = document.getElementById("stlViewer");
        const viewerHeight = stlViewer.clientHeight;
        const viewerWidth = stlViewer.clientWidth;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.setSize(viewerWidth, viewerHeight);
        renderer.setClearColor(0x000000, 0);

        document.getElementById("stlViewer").appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        initializeControls();
    }

    if (object) {
        scene.remove(object);
    }

    setupEnhancedModel(geometry);
    setupEnhancedLighting();
    setupEnhancedCamera();
    animate();

    document.querySelector(".container").style.width = "40%";
    document.getElementById("stlViewer").style.display = "block";

    resizeSTLViewer();
    setTimeout(resizeSTLViewer, 100);
}

function setupEnhancedModel(geometry) {
    if (object) {
        scene.remove(object);
    }

    geometry.center();
    geometry.computeVertexNormals();

    // More realistic material settings
    const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,    // Light grey
        metalness: 0.3,     // Less metallic for more natural look
        roughness: 0.4,     // Moderate roughness
        envMapIntensity: 1,
        flatShading: false,
        side: THREE.DoubleSide
    });

    object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
    object.receiveShadow = true;

    // Optional: Add environment map for better reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create a simple environment map
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const envScene = new THREE.Scene();
    envScene.add(ambientLight);
    const envMap = pmremGenerator.fromScene(envScene).texture;
    material.envMap = envMap;

    scene.add(object);
}

function setupEnhancedLighting() {
    // Clear any existing lights
    scene.clear();

    // Add object back if it exists
    if (object) scene.add(object);

    // Key Light (main light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(-2, 2, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (softer light from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(2, -1, -1);
    scene.add(fillLight);

    // Top Light
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 4, 0);
    scene.add(topLight);

    // Ambient light for overall illumination
    const ambientLight = new THREE.HemisphereLight(
        0xffffff, // Sky color
        0x444444, // Ground color
        1.0       // Intensity
    );
    scene.add(ambientLight);

    // Add some point lights for specular highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);
}

function setupEnhancedCamera() {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Position camera much further back
    camera.position.set(
        maxDim * 4.5,  // Increased distance
        maxDim * 4.5,  // Increased distance
        maxDim * 4.5   // Increased distance
    );
    camera.lookAt(center);
    controls.target.copy(center);

    // Adjust camera properties for better view
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();

    // Adjust control limits
    controls.minDistance = maxDim * 1.5;  // Don't allow too close
    controls.maxDistance = maxDim * 10;   // Don't allow too far
    controls.update();
}

function initializeControls() {
    if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controls.minDistance = 1;
        controls.maxDistance = 500;
        controls.maxPolarAngle = Infinity;
        controls.minPolarAngle = -Infinity;
        controls.enableRotate = true;
        controls.rotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.zoomSpeed = 1.0;
        controls.enablePan = true;
        controls.panSpeed = 1.0;
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;

        controls.enableSmooth = true;
        controls.smoothTime = 0.5;

        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
        };
    }
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 0, -1);
    scene.add(backLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
    topLight.position.set(0, 1, 0);
    scene.add(topLight);
}

function setupCamera() {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const zoom = 2;
    camera.left = -maxDim * zoom;
    camera.right = maxDim * zoom;
    camera.top = maxDim * zoom;
    camera.bottom = -maxDim * zoom;
    camera.near = -1000;
    camera.far = 1000;
    camera.position.set(maxDim, maxDim, maxDim);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);
    if (controls && typeof controls.update === "function") {
        controls.update();
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const resizeObserver = new ResizeObserver(throttle(() => {
    const viewer = document.getElementById("stlViewer");
    const height = viewer.clientHeight;
    viewer.style.width = height + "px";
    
    if (camera && renderer) {
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.setSize(height, height);
    }
}, 100));

document.getElementById("stlViewer").addEventListener('DOMContentLoaded', () => {
    resizeObserver.observe(document.getElementById("stlViewer"));
});


window.addEventListener("load", resizeSTLViewer);