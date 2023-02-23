import {Container} from "@mui/material";
import DicomViewerMultipleAxisControl from "./DicomViewerMultipleAxisControl";
import {useEffect, useState} from "react";

const axisMap = {
    'x': 'axial',
    'y': 'sagittal',
    'z': 'coronal'
}

export default function DicomViewerControls({scenes}) {

    const [originalScenes, setOriginalScenes] = useState({})

    function getCameraFromScene(scene) {
        return scene.getObjectByName('overlayCamera');
    }

    useEffect(() => {
        const originalScenes = scenes.reduce((acc, scene) => {
            acc[scene.name] = {zoom: getCameraFromScene(scene).zoom}
            return acc
        }, {})
        setOriginalScenes(originalScenes)
    }, [scenes])

    function getSceneData(axis) {
        const orientation = axisMap[axis]
        const scene = scenes.find(scene => scene.name === orientation)
        const camera = getCameraFromScene(scene);
        return {orientation, camera};
    }

    function getZoomValue(orientation, newValue) {
        const originalSceneZoom = originalScenes[orientation].zoom
        return (newValue * originalSceneZoom)
    }

    const onScaleChange = (event, newValue, axis) => {
        const {orientation, camera} = getSceneData(axis)
        camera.zoom = getZoomValue(orientation, newValue);
        camera.updateProjectionMatrix();
    }

    const onRotationChange = (event, newValue, axis) => {
        const {_, camera} = getSceneData(axis)
        camera.angle = newValue
    }

    const onPositionChange = (event, newValue, axis) => {
        // const orientation = axisMap[axis]
        // const scene = scenes.find(scene => scene.name === orientation)
        // const mesh = scene.children[1].children[0].children[0]
        const {_, camera} = getSceneData(axis)
        camera.translateZ(newValue)
    }

    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <DicomViewerMultipleAxisControl disabled={scenes.length === 0} max={2} min={0} defaultValue={1} step={0.1}
                                            onChange={onScaleChange} title={"Scale"}/>
            <DicomViewerMultipleAxisControl disabled={scenes.length === 0} max={360} min={0} defaultValue={0} step={1}
                                            onChange={onRotationChange} title={"Rotation"}/>
            <DicomViewerMultipleAxisControl disabled={scenes.length === 0} max={100} min={-100} defaultValue={0}
                                            step={1}
                                            onChange={onPositionChange} title={"Position"}/>
        </Container>
    );
}