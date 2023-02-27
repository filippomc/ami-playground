import {Container} from "@mui/material";
import DicomViewerMultipleAxisControl from "./DicomViewerMultipleAxisControl";
import {useEffect, useState} from "react";
import {X, Y, Z} from "./constants";

const axisMap = {
    'x': 'axial',
    'y': 'sagittal',
    'z': 'coronal'
}

export default function DicomViewerControls({viewHelpers}) {

    const onScaleChange = (event, newValue, axis) => {
        // todo: apply side effects on other views
        const {orientation, camera} = getSceneData(axis)
        camera.zoom = getZoomValue(orientation, newValue);
        camera.updateProjectionMatrix();
    }

    const onRotationChange = (event, newValue, axis) => {
        Object.values(viewHelpers).forEach(viewHelper => {
            switch (axis) {
                case X:
                    return viewHelper.rotateX(newValue)
                case Y:
                    return viewHelper.rotateY(newValue)
                case Z:
                    return viewHelper.rotateZ(newValue)
            }
        })

    }

    const onPositionChange = (event, newValue, axis) => {
        Object.values(viewHelpers).forEach(viewHelper => {
            switch (axis) {
                case X:
                    return viewHelper.translateX(newValue)
                case Y:
                    return viewHelper.translateY(newValue)
                case Z:
                    return viewHelper.translateZ(newValue)
            }
        })
    }

    const isDisabled = viewHelpers === undefined
    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <DicomViewerMultipleAxisControl disabled={isDisabled} max={2} min={0} defaultValue={1} step={0.1}
                                            onChange={onScaleChange} title={"Scale"}/>
            <DicomViewerMultipleAxisControl disabled={isDisabled} max={180} min={-180} defaultValue={0} step={1}
                                            onChange={onRotationChange} title={"Rotation"}/>
            <DicomViewerMultipleAxisControl disabled={isDisabled} max={100} min={-100} defaultValue={0}
                                            step={1} onChange={onPositionChange} title={"Position"}/>
        </Container>
    );
}