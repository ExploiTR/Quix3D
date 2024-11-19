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

        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 100, 200);

        camera = new THREE.OrthographicCamera(
            -10 * aspect,
            10 * aspect,
            10,
            -10,
            0.1,
            1000
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
        renderer.setSize(viewerWidth, viewerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        document.getElementById("stlViewer").appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        initializeControls();
    }

    if (object) {
        scene.remove(object);
    }

    geometry.center();
    const material = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.7,
        metalness: 0.1,
    });

    object = new THREE.Mesh(geometry, material);
    scene.clear();
    scene.add(object);
    setupLighting();
    setupCamera();
    animate();

    document.querySelector(".container").style.width = "40%";
    document.getElementById("stlViewer").style.display = "block";

    resizeSTLViewer();
    setTimeout(resizeSTLViewer, 100);
}

function initializeControls() {
    if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controls.minDistance = 10;
        controls.maxDistance = 5000;
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

window.addEventListener('resize', throttle(function () {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth / 2, window.innerHeight);
    }
}, 100));

window.addEventListener("resize", resizeSTLViewer);
window.addEventListener("load", resizeSTLViewer);