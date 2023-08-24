import * as THREE from 'three';

import * as AMI from 'ami.js';
import {useEffect, useRef} from "react";
import {colors} from '../../utils';
import {Box, Button} from "@mui/material";
import {useSize} from "../../hooks/useSize";
const msgpack = require('@msgpack/msgpack');


window.AMI = AMI;
window.THREE = THREE;

const OPACITY = 0.5;
const StackHelper = AMI.stackHelperFactory(THREE);
const OrthographicCamera = AMI.orthographicCameraFactory(THREE);
const TrackballOrthoControl = AMI.trackballOrthoControlFactory(THREE);


function exportData(stackHelper) {

    if (stackHelper) {
        // Serialize the stack
        const serializedStack = msgpack.encode(stackHelper.stack);

        // Generate a Blob and create a download link
        const blob = new Blob([serializedStack], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'exported-stack.msgpack';
        link.click();
    }
}

export default function CoregistrationViewerPerspective({
                                                            baseStack,
                                                            overlayStack,
                                                            borderColor,
                                                            orientation,
                                                            helperLut,
                                                            onOverlayReady,
                                                            opacity = "55%"
                                                        }) {
    const baseContainerRef = useRef(null);

    const baseSceneRef = useRef(null)

    const baseRendererRef = useRef(null)

    const stackHelperRef = useRef(null)
    const overlayStackHelperRef = useRef(null)

    const baseCameraRef = useRef(null)

    const baseControlsRef = useRef(null)

    const size = useSize(baseContainerRef)

    const hasOverlay = overlayStack !== undefined

    const subscribeEvents = () => {
        const container = baseContainerRef.current
        container.addEventListener('wheel', handleScroll);
    }

    const handleScroll = (event) => {
        const isAdd = event.deltaY > 0
        updateStackHelperIndex(stackHelperRef.current, isAdd)
        if (hasOverlay) {
            updateStackHelperIndex(overlayStackHelperRef.current, isAdd)
            let material = overlayStackHelperRef.current.children[0].children[0].material
            material.transparent = true;
            material.uniforms.uOpacity.value = OPACITY
            material.needsUpdate = true;

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
        const container = baseContainerRef.current
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
    }

    const initScenes = () => {
        baseSceneRef.current = new THREE.Scene();
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
        stackHelper.index = 49
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
            stackHelper.index = 49
            cleanStack(stackHelper)

            stackHelper.orientation = baseCameraRef.current.stackOrientation
            let material = stackHelper.children[0].children[0].material
            material.transparent = true;
            material.uniforms.uOpacity.value = OPACITY
            material.needsUpdate = true;
            baseSceneRef.current.add(stackHelper);
            overlayStackHelperRef.current = stackHelper;
        }
    }, [overlayStack, borderColor, helperLut]);

    // Handle resizes
    useEffect(() => {
        if (baseContainerRef.current) {
            handleResize(baseContainerRef.current, baseCameraRef.current, baseRendererRef.current)
        }
    }, [size])

    const handleResize = (container, camera, renderer) => {
        updateCameraDimensions(camera, container)
        setRendererSize(renderer, container)
    }

    return (
        <Box sx={{position: "relative", height: "100%", width: "100%"}}>
            <Button sx={{position: "absolute", top: 0, right: 0, zIndex:1000, background: "white",}} onClick={() => exportData(overlayStackHelperRef.current)}>Export Data</Button>
            <Box sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}} ref={baseContainerRef}/>
        </Box>
    )
}