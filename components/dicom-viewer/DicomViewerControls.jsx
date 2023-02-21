import {Box, Container, Slider, Typography} from "@mui/material";

export default function DicomViewerControls({scenes}) {

    const onScaleChange = (event, newValue) => {
        scenes.forEach(scene => {
            scene.visible = true
        })
    }
    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <Box>
                <Typography gutterBottom>Scale</Typography>
                <Slider min={0} max={2} step={0.1} defaultValue={1} aria-label="Scale" valueLabelDisplay="auto"
                        disabled={scenes.length === 0}
                        onChange={onScaleChange}
                />
            </Box>
            <Box>
                <Typography gutterBottom>Rotation</Typography>
                <Slider defaultValue={50} aria-label="Rotation" valueLabelDisplay="auto" disabled={scenes.length === 0}
                />
            </Box>
            <Box>
                <Typography gutterBottom>Position</Typography>
                <Slider defaultValue={50} aria-label="Position" valueLabelDisplay="auto" disabled={scenes.length === 0}
                />
            </Box>
        </Container>
    );
}