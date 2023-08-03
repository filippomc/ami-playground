import CoregistrationViewer from "./coregistration-viewer/CoregistrationViewer";
import {Box} from "@mui/material";
import CoregistrationViewerControls from "./coregistration-viewer/controls/CoregistrationViewerControls";
import {useState} from "react";


export default function App() {
    const [viewHelpers, setViewHelpers] = useState(undefined)
    let data = [
        'T1stripvolume.nii.gz',
        'labels.nii.gz'
    ]
    let files = data.map(function (v) {
        return 'http://localhost:1234/' + v;
    });

    const lutData = {
        lut: 'hot_and_cold',
        lutO: 'linear',
        color: [[0, 0, 0, 0], [1, 1, 1, 1]],
        opacity: [[0, 1], [1, 1]],
    }

    const handleDicomViewerMount = (vh) => {
        setViewHelpers(vh)
    }
    return (
        <Box sx={{height: "100vh", width: "100%", display: "flex", flexDirection: "row"}}>
            <CoregistrationViewerControls viewHelpers={viewHelpers}/>
            <CoregistrationViewer files={files} lutData={lutData} onOverlayReady={handleDicomViewerMount}/>
        </Box>
    );
}