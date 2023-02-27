import * as THREE from 'three';

import * as AMI from 'ami.js';
import {useEffect, useRef} from "react";
import {colors} from '../../utils';
import {Box} from "@mui/material";
import {useSize} from "../../hooks/useSize";


window.AMI = AMI;
window.THREE = THREE;

const StackHelper = AMI.stackHelperFactory(THREE);
const OrthographicCamera = AMI.orthographicCameraFactory(THREE);
const TrackballOrthoControl = AMI.trackballOrthoControlFactory(THREE);

const orientationMap = {
    'axial': 0,
    'sagittal': 1,
    'coronal': 2,
}

export default function DicomViewerView({
                                            baseStack,
                                            overlayStack,
                                            borderColor,
                                            orientation,
                                            helperLut,
                                            onOverlayReady,
                                            opacity = "55%"
                                        }) {
    const baseContainerRef = useRef(null);
    const overlayContainerRef = useRef(null);

    const baseSceneRef = useRef(null)
    const overlaySceneRef = useRef(null)

    const baseRendererRef = useRef(null)
    const overlayRendererRef = useRef(null)

    const stackHelperRef = useRef(null)
    const overlayStackHelperRef = useRef(null)

    const baseCameraRef = useRef(null)
    const overlayCameraRef = useRef(null)

    const baseControlsRef = useRef(null)
    const overlayControlsRef = useRef(null)

    const size = useSize(baseContainerRef)

    const hasOverlay = overlayStack !== undefined

    const subscribeEvents = () => {
        const container = hasOverlay ? overlayContainerRef.current : baseContainerRef.current
        container.addEventListener('wheel', handleScroll);
        document.addEventListener('resize', () => console.log("Test"));
    }

    const handleScroll = (event) => {
        const isAdd = event.deltaY > 0
        updateStackHelperIndex(stackHelperRef.current, isAdd)
        if (hasOverlay) {
            updateStackHelperIndex(overlayStackHelperRef.current, isAdd)
        }
    }

    const updateStackHelperIndex = (stackHelper, isAdd) => {
        if (stackHelper) {
            if (isAdd) {
                if (stackHelper.index >= stackHelper.orientationMaxIndex - 1) {
                    return
                }
                stackHelper.index = stackHelper.index + 1;
            } else {
                if (stackHelper.index <= 0) {
                    return
                }
                stackHelper.index = stackHelper.index - 1;
            }
        }
    }

    const unSubscribeEvents = () => {
        const container = hasOverlay ? overlayContainerRef.current : baseContainerRef.current
        container.removeEventListener('wheel', handleScroll);
    }

    useEffect(() => {
        initViewer()
        animate()
        subscribeEvents()
        return () => {
            unSubscribeEvents()
        }
    }, []);

    const animate = () => {
        const baseControls = baseControlsRef.current
        const baseRenderer = baseRendererRef.current
        const baseScene = baseSceneRef.current
        const baseCamera = baseCameraRef.current

        baseControls.update();
        baseRenderer.render(baseScene, baseCamera);
        if (hasOverlay) {
            const overlayRenderer = overlayRendererRef.current
            const overlayScene = overlaySceneRef.current
            const overlayCamera = overlayCameraRef.current
            const overlayControls = overlayControlsRef.current

            overlayControls.update();
            overlayRenderer.render(overlayScene, overlayCamera);
        }

        requestAnimationFrame(function () {
            animate();
        });
    };

    const initViewer = () => {
        initRenderers()
        initScenes();
        initCameras();
        initControls();
    }


    function setRendererSize(renderer, container) {
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    function getRenderer(container) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        setRendererSize(renderer, container);
        renderer.setClearColor(colors.darkGrey, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        return renderer
    }

    const initRenderers = () => {
        const baseContainer = baseContainerRef.current
        baseRendererRef.current = getRenderer(baseContainer);

        if (hasOverlay) {
            const overlayContainer = overlayContainerRef.current
            overlayRendererRef.current = getRenderer(overlayContainer);
        }
    }

    const initScenes = () => {
        baseSceneRef.current = new THREE.Scene();
        if (hasOverlay) {
            overlaySceneRef.current = new THREE.Scene();
            overlaySceneRef.current.name = orientation;
        }
    }

    function getOrthographicCamera(container) {
        const camera = new OrthographicCamera(
            container.clientWidth / -2,
            container.clientWidth / 2,
            container.clientHeight / 2,
            container.clientHeight / -2,
            0.1,
            10000
        );
        camera.position.z = 0;
        camera.position.y = 0;
        camera.position.x = 0;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.fov = 50;
        return camera
    }

    const initCameras = () => {
        const baseContainer = baseContainerRef.current
        const baseScene = baseSceneRef.current
        baseCameraRef.current = getOrthographicCamera(baseContainer);
        baseScene.add(baseCameraRef.current)
        if (hasOverlay) {
            const overlayContainer = overlayContainerRef.current
            const overlayScene = overlaySceneRef.current
            overlayCameraRef.current = getOrthographicCamera(overlayContainer);
            overlayCameraRef.current.name = "overlayCamera"
            overlayScene.add(overlayCameraRef.current)
        }

    }

    function getControls(camera, baseContainer) {
        const controls = new TrackballOrthoControl(camera, baseContainer);
        controls.staticMoving = true;
        controls.noRotate = true;
        return controls
    }

    const initControls = () => {
        const baseCamera = baseCameraRef.current
        const baseContainer = baseContainerRef.current
        baseControlsRef.current = getControls(baseCamera, baseContainer);
        baseCamera.controls = baseControlsRef.current;
        if (hasOverlay){
            const overlayContainer = overlayContainerRef.current
            const overlayCamera = overlayCameraRef.current
            overlayControlsRef.current = getControls(overlayCamera, overlayContainer);
            overlayCamera.controls = baseControlsRef.current;
        }
    }

    function updateCameraDimensions(camera, container) {
        camera.canvas = {
            width: container.clientWidth,
            height: container.clientHeight,
        };
    }

    function positionCamera(container, camera, stack) {
        // center camera and interactor to center of bounding box
        const worldBB = stack.worldBoundingBox();
        const lpsDims = new THREE.Vector3(
            worldBB[1] - worldBB[0],
            worldBB[3] - worldBB[2],
            worldBB[5] - worldBB[4]
        );
        const box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
        };

        updateCameraDimensions(camera, container);

        camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
        camera.box = box;
        camera.orientation = orientation;
        camera.update();
        camera.fitBox(2);
    }

    useEffect(() => {
        const baseCamera = baseCameraRef.current
        const baseContainer = baseContainerRef.current

        const stackHelper = new StackHelper(baseStack);
        stackHelper.bbox.visible = false;
        stackHelper.border.color = colors.darkGrey;
        stackHelper.orientation = orientationMap[orientation];
        baseSceneRef.current.add(stackHelper);
        stackHelperRef.current = stackHelper;
        positionCamera(baseContainer, baseCamera, baseStack);

    }, [baseStack]);


    function setTransparentBackground(child) {
        // TODO:
    }

    function cleanStack(stackHelper) {
        for (let i = stackHelper.children.length - 1; i >= 0; i--) {
            if (i !== 1) {
                const child = stackHelper.children[i];
                stackHelper.remove(child);
            }
        }
        setTransparentBackground(stackHelper.children[0].children[0]);
    }

    useEffect(() => {
        if (overlayStack && helperLut) {
            const stackHelper = new StackHelper(overlayStack);
            stackHelper.bbox.visible = false;
            stackHelper.border.color = borderColor;
            stackHelper.slice.lut = helperLut.lut;
            stackHelper.slice.lutTexture = helperLut.texture;
            stackHelper.orientation = orientationMap[orientation];
            cleanStack(stackHelper)
            overlaySceneRef.current.add(stackHelper);
            overlayStackHelperRef.current = stackHelper;
            const overlayContainer = overlayContainerRef.current
            const overLayCamera = overlayCameraRef.current
            positionCamera(overlayContainer, overLayCamera, overlayStack);
            onOverlayReady(overlaySceneRef.current, overlayContainerRef.current, overlayStackHelperRef.current)
        }
    }, [overlayStack, borderColor, helperLut]);

    // Handle resizes
    useEffect(() => {
        if (baseContainerRef.current) {
            handleResize(baseContainerRef.current, baseCameraRef.current, baseRendererRef.current)
        }
        if (overlayRendererRef.current) {
            handleResize(overlayContainerRef.current, overlayCameraRef.current, overlayRendererRef.current)
        }
    }, [size])

    const handleResize = (container, camera, renderer) => {
        updateCameraDimensions(camera, container)
        setRendererSize(renderer, container)
    }

    return (
        <Box sx={{position: "relative", height: "100%", width: "100%"}}>
            <Box sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}} ref={baseContainerRef}/>
            {hasOverlay &&
                <Box id={orientation} sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%", opacity: opacity}}
                     ref={overlayContainerRef}/>}
        </Box>
    )
}