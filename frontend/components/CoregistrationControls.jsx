import {Container} from "@mui/material";
import CoregistrationViewerMultipleAxisControl from "./CoregistrationViewerMultipleAxisControl";
import {POSITION, ROTATION, SCALE} from "../constants";

export default function CoregistrationViewerControls({onChange}) {


    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <CoregistrationViewerMultipleAxisControl  max={10} min={-10} defaultValue={0} step={1}
                                                     onChange={(axis, value)=>onChange(SCALE, axis, value)} title={"Scale"}/>
            <CoregistrationViewerMultipleAxisControl  max={180} min={-180} defaultValue={0} step={1}
                                                      onChange={(axis, value)=>onChange(ROTATION, axis, value)} title={"Rotation"}/>
            <CoregistrationViewerMultipleAxisControl max={10} min={-10} defaultValue={0}
                                                     step={1} onChange={(axis, value)=>onChange(POSITION, axis, value)} title={"Position"}/>
        </Container>
    );
}