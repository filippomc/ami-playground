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

    function getCamera(scene) {
        return scene.getObjectByName('overlayCamera');
    }

    useEffect(() => {
        const originalScenes = scenes.reduce((acc, scene) => {
            acc[scene.name] = {zoom: getCamera(scene).zoom}
            return acc
        }, {})
        setOriginalScenes(originalScenes)
    }, [scenes])

    function getZoomValue(orientation, newValue) {
        const originalSceneZoom = originalScenes[orientation].zoom
        return (newValue * originalSceneZoom)
    }

    const onScaleChange = (event, newValue, axis) => {
        const orientation = axisMap[axis]
        const scene = scenes.find(scene => scene.name === orientation)
        const camera = getCamera(scene);
        camera.zoom = getZoomValue(orientation, newValue);
        camera.updateProjectionMatrix();
    }

    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <DicomViewerMultipleAxisControl disabled={scenes.length === 0} max={2} min={0} defaultValue={1} step={0.1}
                                            onChange={onScaleChange} title={"Scale"}/>
        </Container>
    );
}