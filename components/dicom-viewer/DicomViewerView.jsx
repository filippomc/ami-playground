import * as THREE from 'three';

import * as AMI from 'ami.js';
import {useEffect, useRef} from "react";
import {colors} from '../../utils';
import {Box} from "@mui/material";


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
                                            lutData,
                                            orientation,
                                            lutContainer,
                                            helperLut,
                                            ...props
                                        }) {
    const baseContainerRef = useRef(null);
    const overlayContainerRef = useRef(null);

    const baseSceneRef = useRef(null)
    const overlaySceneRef = useRef(null)

    const baseRendererRef = useRef(null)
    const overlayRendererRef = useRef(null)

    const stackHelperRef = useRef(null)
    const overlayStackHelperRef = useRef(null)

    const cameraRef = useRef(null)
    const controlsRef = useRef(null)

    const hasOverlay = overlayStack !== undefined
    // todo: handle dicomViewer resize

    const subscribeEvents = () => {
        const container = hasOverlay ? overlayContainerRef.current : baseContainerRef.current
        container.addEventListener('wheel', handleScroll);
    }

    const handleScroll = (event) => {
        const isAdd = event.deltaY > 0
        updateStackHelperIndex(stackHelperRef.current, isAdd)
        if(hasOverlay) {
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
            }else{
                if (stackHelper.index <= 0) {
                    return
                }
                stackHelper.index = stackHelper.index - 1;
            }
        }

    }

    const unSubscribeEvents = () => {
        const container = hasOverlay ? overlayContainerRef.current : baseContainerRef.current
        container.removeEventListener('wheel');
    }

    useEffect(() => {
        initViewer()
        animate()
        subscribeEvents()
        return () => {
            unSubscribeEvents()
            // TODO: Clear dom elements
        }
    }, []);

    const animate = () => {
        const controls = controlsRef.current
        const baseRenderer = baseRendererRef.current
        const overlayRenderer = overlayRendererRef.current
        const baseScene = baseSceneRef.current
        const overlayScene = overlaySceneRef.current
        const baseCamera = cameraRef.current

        controls.update();
        baseRenderer.render(baseScene, baseCamera);
        if (hasOverlay) {
            overlayRenderer.render(overlayScene, baseCamera);
        }

        requestAnimationFrame(function () {
            animate();
        });
    };

    const initViewer = () => {
        initRenderers()
        initScenes();
        initCamera();
        initControls();
    }


    function getRenderer(container) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setSize(container.offsetWidth, container.offsetHeight);
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
        }
    }

    const initCamera = () => {
        const baseContainer = baseContainerRef.current

        cameraRef.current = new OrthographicCamera(
            baseContainer.clientWidth / -2,
            baseContainer.clientWidth / 2,
            baseContainer.clientHeight / 2,
            baseContainer.clientHeight / -2,
            0.1,
            10000
        );
    }

    const initControls = () => {
        const camera = cameraRef.current
        const baseContainer = baseContainerRef.current

        controlsRef.current = new TrackballOrthoControl(camera, baseContainer);
        controlsRef.current.staticMoving = true;
        controlsRef.current.noRotate = true;
        camera.controls = controlsRef.current;
    }

    useEffect(() => {
        const camera = cameraRef.current
        const baseContainer = baseContainerRef.current

        const stackHelper = new StackHelper(baseStack);
        stackHelper.bbox.visible = false;
        stackHelper.border.color = colors.darkGrey;
        baseSceneRef.current.add(stackHelper);
        stackHelperRef.current = stackHelper;

        // center camera and interactor to center of bounding box
        const worldBB = baseStack.worldBoundingBox();
        const lpsDims = new THREE.Vector3(
            worldBB[1] - worldBB[0],
            worldBB[3] - worldBB[2],
            worldBB[5] - worldBB[4]
        );
        const box = {
            center: baseStack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
        };

        const canvas = {
            width: baseContainer.clientWidth,
            height: baseContainer.clientHeight,
        };

        camera.directions = [baseStack.xCosine, baseStack.yCosine, baseStack.zCosine];
        camera.box = box;
        camera.canvas = canvas;
        camera.orientation = orientation;
        camera.update();
        camera.fitBox(2);
    }, [baseStack]);


    useEffect(() => {
        if (overlayStack && helperLut) {
            const stackHelper = new StackHelper(overlayStack);
            stackHelper.bbox.visible = false;
            stackHelper.border.color = borderColor;
            stackHelper.slice.lut = helperLut.lut;
            stackHelper.slice.lutTexture = helperLut.texture;
            stackHelper.orientation = orientationMap[orientation];
            overlaySceneRef.current.add(stackHelper);
            overlayStackHelperRef.current = stackHelper;
        }
    }, [overlayStack, borderColor, helperLut]);


    return (
        <Box sx={{position: "relative", height: "100%", width: "100%"}}>

            <Box sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}} ref={baseContainerRef}/>
            <Box sx={{position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}}
                 ref={overlayContainerRef}/>
        </Box>
    )
}