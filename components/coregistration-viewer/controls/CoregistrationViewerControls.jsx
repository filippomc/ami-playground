import {Container} from "@mui/material";
import CoregistrationViewerMultipleAxisControl from "./CoregistrationViewerMultipleAxisControl";
import {X, Y, Z} from "../constants";

export default function CoregistrationViewerControls({viewHelpers}) {

    const onScaleChange = (event, newValue, axis) => {
        Object.values(viewHelpers).forEach(viewHelper => {
            switch (axis) {
                case X:
                    return viewHelper.scaleX(newValue)
                case Y:
                    return viewHelper.scaleY(newValue)
                case Z:
                    return viewHelper.scaleZ(newValue)
            }
        })
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
            <CoregistrationViewerMultipleAxisControl disabled={isDisabled} max={10} min={-10} defaultValue={0} step={1}
                                                     onChange={onScaleChange} title={"Scale"}/>
            <CoregistrationViewerMultipleAxisControl disabled={isDisabled} max={180} min={-180} defaultValue={0} step={1}
                                                     onChange={onRotationChange} title={"Rotation"}/>
            <CoregistrationViewerMultipleAxisControl disabled={isDisabled} max={10} min={-10} defaultValue={0}
                                                     step={1} onChange={onPositionChange} title={"Position"}/>
        </Container>
    );
}