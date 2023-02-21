import DicomViewer from "./dicom-viewer/DicomViewer";
import {Box} from "@mui/material";
import DicomViewerControls from "./dicom-viewer/DicomViewerControls";
import {useState} from "react";


export default function App() {
    const [scenes, setScenes] = useState([])
    let data = [
        'patient2/7002_t1_average_BRAINSABC.nii.gz',
        'patient1/7001_t1_average_BRAINSABC.nii.gz',
    ];
    let files = data.map(function (v) {
        return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/' + v;
    });

    const lutData = {
        lut: 'hot_and_cold',
        lutO: 'linear',
        color: [[0, 0, 0, 0], [1, 1, 1, 1]],
        opacity: [[0, 1], [1, 1]],
    }

    const handleDicomViewerMount = (scenes) => {
        setScenes(scenes)
    }
    return (
        <Box sx={{height: "100vh", width: "100%", display: "flex", flexDirection: "row" }}>
            <DicomViewerControls scenes={scenes}/>
            <DicomViewer files={files} lutData={lutData} onMount={handleDicomViewerMount}/>
        </Box>
    );
}