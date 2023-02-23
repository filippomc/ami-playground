import {Container} from "@mui/material";
import DicomViewerMultipleAxisControl from "./DicomViewerMultipleAxisControl";
import {useEffect, useState} from "react";

const axisMap = {
    'x': 'axial',
    'y': 'sagittal',
    'z': 'coronal'
}

export default function DicomViewerControls({scenes, containers}) {

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
        // todo: apply side effects on other views
        const {orientation, camera} = getSceneData(axis)
        camera.zoom = getZoomValue(orientation, newValue);
        camera.updateProjectionMatrix();
    }

    const onRotationChange = (event, newValue, axis) => {
        // todo: apply side effects on other views
        const {_, camera} = getSceneData(axis)
        camera.angle = newValue
    }

    function getStyle(axis, newValue) {
        switch (axis) {
            case 'x':
                if(newValue < 0) {
                    return {style: 'left', value: `${newValue}px`}
                } else {
                    return {style: 'left', value: `${newValue}px`}
                }
            case 'y':
                if(newValue < 0) {
                    return {style: 'top', value: `${newValue*-1}px`}
                } else {
                    return {style: 'top', value: `${newValue*-1}px`}
                }
            default:
                return null
        }
    }

    const onPositionChange = (event, newValue, axis) => {
        // todo: apply side effects on other views
        const orientation = axisMap[axis]
        const container = containers.find(container => container.id === 'axial')
        const styleData = getStyle(axis, newValue)

        if(styleData) {
            const {style, value} = styleData
            container.style[style] = value
        }
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