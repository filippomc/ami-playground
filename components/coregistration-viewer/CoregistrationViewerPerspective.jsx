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

export default function CoregistrationViewerPerspective({
                                                            baseStack,
                                                            overlayStack,
                                                            borderColor,
                                                            orientation,
                                                            helperLut,
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

    const hasOverlay = overlayStack !== undefined

    const subscribeEvents = () => {
        const container = hasOverlay ? overlayContainerRef.current : baseContainerRef.current
        container.addEventListener('wheel', handleScroll);
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
        renderer.setClearColor(colors.black, 0);
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
        const camera =  new OrthographicCamera(
            container.clientWidth / -2,
            container.clientWidth / 2,
            container.clientHeight / 2,
            container.clientHeight / -2,
            1,
            1000
        )
        camera.fov = 50;
        camera.aspect = 1;
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
        if (hasOverlay) {
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

    function updateCamera(container, camera, stack) {
        // center camera and interactor to center of bounding box
        const centerLPS = stack.worldCenter()
        camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
        camera.updateProjectionMatrix();

        const worldBB = stack.worldBoundingBox();
        const lpsDims = new THREE.Vector3(
            (worldBB[1] - worldBB[0]) / 2,
            (worldBB[3] - worldBB[2]) / 2,
            (worldBB[5] - worldBB[4]) / 2
        );
        const box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 5, lpsDims.y + 5, lpsDims.z + 5),
        };

        updateCameraDimensions(camera, container);

        camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
        camera.box = box;
        camera.orientation = orientation;
        camera.update();
        camera.fitBox(2,1);
    }

    useEffect(() => {
        const baseCamera = baseCameraRef.current
        const baseContainer = baseContainerRef.current

        const stackHelper = new StackHelper(baseStack);
        stackHelper.bbox.visible = false;
        stackHelper.border.color = colors.darkGrey;
        baseSceneRef.current.add(stackHelper);
        stackHelperRef.current = stackHelper;
        updateCamera(baseContainer, baseCamera, baseStack);
        stackHelper.orientation = baseCamera.stackOrientation

    }, [baseStack]);


    function cleanStack(stackHelper) {
        for (let i = stackHelper.children.length - 1; i >= 0; i--) {
            if (i !== 1) {
                const child = stackHelper.children[i];
                stackHelper.remove(child);
            }
        }
    }

    useEffect(() => {
        if (overlayStack && helperLut) {
            const stackHelper = new StackHelper(overlayStack);
            stackHelper.bbox.visible = false;
            stackHelper.border.color = borderColor;
            stackHelper.slice.lut = helperLut.lut;
            stackHelper.slice.lutTexture = helperLut.texture;
            cleanStack(stackHelper)
            overlaySceneRef.current.add(stackHelper);
            overlayStackHelperRef.current = stackHelper;
            const overlayContainer = overlayContainerRef.current
            const overlayCamera = overlayCameraRef.current
            updateCamera(overlayContainer, overlayCamera, overlayStack);
            stackHelper.orientation = overlayCamera.stackOrientation
        }
    }, [overlayStack, borderColor, helperLut]);


    return (
        <Box sx={{position: "relative", height: "100%", width: "100%"}}>
            <Box sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}} ref={baseContainerRef}/>
            {hasOverlay &&
                <Box id={orientation} sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    opacity: opacity,
                }}
                     ref={overlayContainerRef}/>}
        </Box>
    )
}