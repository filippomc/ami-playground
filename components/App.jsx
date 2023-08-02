import DicomViewer from "./dicom-viewer/DicomViewer";
import {Box} from "@mui/material";
import CustomLUT from "../customLUT";



export default function App() {
    // the order in the data array is used to define the order of layers. Index 0 is the base layer
    let data = [
        'T1stripvolume.nii.gz',
        'labels.nii.gz',
    ]
    let files = data.map(function (v) {
        return 'http://localhost:1234/' + v;
    });

    const baseLutData = {
        lut: 'default',
        lutO: 'linear',
        color: [[0, 0, 0, 0], [1, 1, 1, 1]],
        opacity: [[0, 1], [1, 1]],
        discrete: false,
        isCustom: false
    }

    const overlaysLutData = {
        lut: 'default',
        lutO: 'linear',
        color: CustomLUT,
        opacity: [[0, 0], [0.005, 1]],
        discrete: true,
        isCustom: true
    }

    return (
        <Box sx={{height: "100vh", width: "100%", display: "flex", flexDirection: "row"}}>
            <DicomViewer files={files} baseLutData={baseLutData} overlayLutData={overlaysLutData}/>
        </Box>
    );
}