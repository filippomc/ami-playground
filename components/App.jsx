import DicomViewer from "./dicom-viewer/DicomViewer";
import {Box} from "@mui/material";


export default function App() {
    // the order in the data array is used to define the order of layers. Index 0 is the base layer
    let data = [
        'T1stripvolume.nii.gz',
        'labels.nii.gz',
        'labels.nii.gz',
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

    return (
        <Box sx={{height: "100vh", width: "100%", display: "flex", flexDirection: "row"}}>
            <DicomViewer files={files} lutData={lutData}/>
        </Box>
    );
}