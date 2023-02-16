import DicomViewer from "./dicom-viewer/DicomViewer";
import {Box} from "@mui/material";


export default function App() {
    let data = [
        'patient2/7002_t1_average_BRAINSABC.nii.gz',
        'patient1/7001_t1_average_BRAINSABC.nii.gz',
    ];
    let files = data.map(function (v) {
        return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/' + v;
    });

    return (
        <Box sx={{height: "100vh"}}>
            <DicomViewer files={files}/>
        </Box>
    );
}