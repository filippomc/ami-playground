import {Box, Container, Slider, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Vector2} from "three";
import * as THREE from "three";

export default function DicomViewerControls({scenes}) {

    const onPositionChange = (event, newValue, axis) => {
        scenes.forEach((scene) => {
            console.log("Position Changed")
        })
    }

    return (
        <Container sx={{display: "flex", flexDirection: "column", width: "10em"}}>
            <Typography>Position</Typography>
            <Box>
                <Typography gutterBottom>X</Typography>
                <Slider min={-100} max={100} step={0.1} defaultValue={0} aria-label="X" valueLabelDisplay="auto"
                        disabled={scenes.length === 0}
                        onChange={(event, newValue) => onPositionChange(event, newValue, 'x')}
                />
            </Box>
            <Box>
                <Typography gutterBottom>Y</Typography>
                <Slider min={-1} max={1} step={0.1} defaultValue={0} aria-label="Y" valueLabelDisplay="auto"
                        disabled={scenes.length === 0}
                        onChange={(event, newValue) => onPositionChange(event, newValue, 'y')}
                />
            </Box>
            <Box>
                <Typography gutterBottom>Z</Typography>
                <Slider min={-1} max={1} step={0.1} defaultValue={0} aria-label="Z" valueLabelDisplay="auto"
                        disabled={scenes.length === 0}
                        onChange={(event, newValue) => onPositionChange(event, newValue, 'z')}
                />
            </Box>
        </Container>
    );
}