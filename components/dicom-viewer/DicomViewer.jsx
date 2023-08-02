import {useEffect, useRef, useState} from "react";
import * as THREE from 'three';
import * as AMI from "ami.js";
import {Box} from "@mui/material";
import {orderSeries} from '../../utils';
import {
    DataFragmentShader,
    DataUniformShader,
    DataVertexShader,
    LayerFragmentShader,
    LayerUniformShader,
    LayerVertexShader
} from "ami.js/src/shaders/shaders";

const StackHelper = AMI.stackHelperFactory(THREE);
const OrthographicCamera = AMI.orthographicCameraFactory(THREE);
const TrackballOrthoControls = AMI.trackballOrthoControlFactory(THREE);

export default function DicomViewer({files}) {
    const containerRef = useRef(null);
    const [isReady, setIsReady] = useState(false)

    // scenes
    const sceneRef = useRef(new THREE.Scene());
    const hiddenSceneBaseLayerRef = useRef(new THREE.Scene());
    const hiddenSceneOverlaysLayerRef = useRef(new THREE.Scene());

    // renderers
    const rendererRef = useRef(null);
    const renderTargetBaseRef = useRef(null)
    const renderTargetOverlaysRef = useRef(null)

    // camera
    const cameraRef = useRef(null)

    // controls
    const controlsRef = useRef(null)

    // stacks
    const baseStackRef = useRef(null)
    const baseStackHelperRef = useRef(null);


    useEffect(() => {
        initViewer()
        animate()
        loadModel()
    }, [])

    const initViewer = () => {
        initRenderers()
        initCameras()
        initControls()
    }

    const initRenderers = () => {
        const container = containerRef.current
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x607D8B, 1);
        container.appendChild(renderer.domElement);

        rendererRef.current = renderer
        renderTargetBaseRef.current = getWebGLRenderTarget()
        renderTargetOverlaysRef.current = getWebGLRenderTarget()
    }


    function getWebGLRenderTarget() {
        return new THREE.WebGLRenderTarget(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            }
        );
    }

    const initCameras = () => {
        const container = containerRef.current
        cameraRef.current = new OrthographicCamera(
            container.clientWidth / -2,
            container.clientWidth / 2,
            container.clientHeight / 2,
            container.clientHeight / -2,
            0.1,
            10000
        )
    }

    const initControls = () => {
        const camera = cameraRef.current
        const container = containerRef.current

        const controls = new TrackballOrthoControls(camera, container);
        controls.staticMoving = true;
        controls.noRotate = true;

        camera.controls = controls;
        controlsRef.current = controls
    }

    const animate = () => {
        const controls = controlsRef.current
        const renderer = rendererRef.current

        controls.update()

        renderToTarget(hiddenSceneBaseLayerRef.current, renderTargetBaseRef.current)
        renderToTarget(hiddenSceneOverlaysLayerRef.current, renderTargetOverlaysRef.current)
        renderer.setRenderTarget(null) // setting to null renders to screen
        renderer.render(sceneRef.current, cameraRef.current)

        requestAnimationFrame(function () {
            animate();
        });
    }

    const renderToTarget = (scene, target) => {
        const renderer = rendererRef.current
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(scene, cameraRef.current);
    }

    const loadModel = () => {
        const container = containerRef.current
        const loader = new AMI.VolumeLoader(container); // Shows the progress bar in the container

        console.log("start loading")
        loader.load(files, undefined).then(() => {
            console.log("loading handler")
            let series
            try {
                series = orderSeries(files, loader.data[0].mergeSeries(loader.data))
            } catch (e) {
                console.log(e)
            }
            if (!series || series.length === 0) {
                loader.free();
                return
            }
            handleSeries(series);
            loader.free();
            setIsReady(true)
        })
    }

    function handleSeries(series) {
        const baseStack = series[0].stack[0];
        baseStackRef.current = baseStack

        initStackHelper(baseStack);
        hiddenSceneBaseLayerRef.current.add(baseStackHelperRef.current)

        const overlayStacks = series.slice(1).map(series => series.stack[0]);

        /***
         * The loop is for the basic rendering of each individual overlay stack.
         * Here, a shader (ShadersDataFragment and ShadersDataVertex) is created for each overlay stack to render its raw data into textures.
         * These shaders are responsible for the primary data rendering of each layer,
         * transforming raw medical imaging data into interpretable visual representations.
         */
        for (let overlayStack of overlayStacks) {
            overlayStack.prepare()
            overlayStack.pack()

            const textures = getTextures(overlayStack);
            const uniforms = getUniforms(overlayStack, textures);
            const material = getDataShaderMaterial(uniforms);

            const mesh = new THREE.Mesh(baseStackHelperRef.current.slice.geometry, material);
            mesh.applyMatrix4(baseStack._ijk2LPS);
            hiddenSceneOverlaysLayerRef.current.add(mesh);
        }

        /***
         * And now we mix the content of the two hidden scenes and add it to the visible scene.
         */
        const uniformsBlend = LayerUniformShader.uniforms();
        uniformsBlend.uTextureBackTest0.value = renderTargetBaseRef.current.texture;
        uniformsBlend.uTextureBackTest1.value = renderTargetOverlaysRef.current.texture;
        const materialBlend = getLayerShaderMaterial(uniformsBlend, true)
        const meshBlend = new THREE.Mesh(baseStackHelperRef.current.slice.geometry, materialBlend);
        meshBlend.applyMatrix4(baseStack._ijk2LPS);
        sceneRef.current.add(meshBlend);
    }

    function initStackHelper(stack) {
        const stackHelper = new StackHelper(stack);
        stackHelper.bbox.visible = false;
        stackHelper.border.visible = false;
        stackHelper.index = 100; // testing only

        baseStackHelperRef.current = stackHelper;
    }

    function getTextures(overlayStack) {
        const textures = [];
        for (let m = 0; m < overlayStack._rawData.length; m++) {
            const texture = new THREE.DataTexture(
                overlayStack.rawData[m],
                overlayStack.textureSize,
                overlayStack.textureSize,
                overlayStack.textureType,
                THREE.UnsignedByteType,
                THREE.UVMapping,
                THREE.ClampToEdgeWrapping,
                THREE.ClampToEdgeWrapping,
                THREE.NearestFilter,
                THREE.NearestFilter);
            texture.needsUpdate = true;
            texture.flipY = true; // todo: why?
            textures.push(texture);
        }
        return textures;
    }

    function getUniforms(stack, textures) {
        const uniforms = DataUniformShader.uniforms();
        uniforms.uTextureSize.value = stack.textureSize;
        uniforms.uTextureContainer.value = textures;
        uniforms.uWorldToData.value = stack.lps2IJK;
        uniforms.uNumberOfChannels.value = stack.numberOfChannels;
        uniforms.uPixelType.value = stack.pixelType;
        uniforms.uBitsAllocated.value = stack.bitsAllocated;
        uniforms.uWindowCenterWidth.value = [stack.windowCenter, stack.windowWidth];
        uniforms.uRescaleSlopeIntercept.value = [stack.rescaleSlope, stack.rescaleIntercept];
        uniforms.uDataDimensions.value = [stack.dimensionsIJK.x, stack.dimensionsIJK.y, stack.dimensionsIJK.z];
        uniforms.uInterpolation.value = 0;
        return uniforms
    }

    function getDataShaderMaterial(uniforms, transparent = false) {
        const fragmentShader = new DataFragmentShader(uniforms);
        const vertexShader = new DataVertexShader()
        return new THREE.ShaderMaterial(
            {
                side: THREE.DoubleSide,
                uniforms: uniforms,
                fragmentShader: fragmentShader.compute(),
                vertexShader: vertexShader.compute(),
                transparent: transparent
            }
        );
    }

    function getLayerShaderMaterial(uniforms, transparent = false) {
        const fragmentShader = new LayerFragmentShader(uniforms);
        const vertexShader = new LayerVertexShader()
        return new THREE.ShaderMaterial(
            {
                side: THREE.DoubleSide,
                uniforms: uniforms,
                fragmentShader: fragmentShader.compute(),
                vertexShader: vertexShader.compute(),
                transparent: transparent
            }
        );
    }

    useEffect(() => {
        if (!isReady) {
            return
        }
        updateCamera()
    }, [isReady])

    function updateCamera() {
        const stack = baseStackRef.current
        const camera = cameraRef.current
        const container = containerRef.current

        const worldbb = stack.worldBoundingBox();
        const lpsDims = new THREE.Vector3(
            worldbb[1] - worldbb[0],
            worldbb[3] - worldbb[2],
            worldbb[5] - worldbb[4]
        );
        const box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 5, lpsDims.y + 5, lpsDims.z + 5),
        };
        const canvasDimensions = {
            width: container.clientWidth,
            height: container.clientHeight,
        };
        camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
        camera.box = box;
        camera.canvas = canvasDimensions;
        camera.update()
        camera.fitBox(2); //This call adjusts the camera's zoom level and position to ensure the entire volume can be seen on the screen

        console.log(sceneRef.current)
        console.log(camera)
    }

    return <Box ref={containerRef} sx={{height: "100%", width: "100%",}}>

    </Box>
}