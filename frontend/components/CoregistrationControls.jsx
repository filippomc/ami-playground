import {Container} from "@mui/material";
import CoregistrationViewerMultipleAxisControl from "./CoregistrationViewerMultipleAxisControl";

export default function CoregistrationViewerControls({onChange}) {


    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <CoregistrationViewerMultipleAxisControl  max={10} min={-10} defaultValue={0} step={1}
                                                     onChange={(axis, value)=>onChange('scale', axis, value)} title={"Scale"}/>
            <CoregistrationViewerMultipleAxisControl  max={180} min={-180} defaultValue={0} step={1}
                                                      onChange={(axis, value)=>onChange('rotation', axis, value)} title={"Rotation"}/>
            <CoregistrationViewerMultipleAxisControl max={10} min={-10} defaultValue={0}
                                                     step={1} onChange={(axis, value)=>onChange('position', axis, value)} title={"Position"}/>
        </Container>
    );
}