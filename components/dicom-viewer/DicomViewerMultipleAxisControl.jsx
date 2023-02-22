import {Box, Slider, Typography} from "@mui/material";

export default function DicomViewerMultipleAxisControl({title, disabled, min, max, step, defaultValue, onChange}) {
    return (
        <Box>
            <Typography>{title}</Typography>
            <Box>
                <Typography>X</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="X"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange(event, newValue, 'x')}
                />
            </Box>
            <Box>
                <Typography>Y</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="Y"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange(event, newValue, 'y')}
                />
            </Box>
            <Box>
                <Typography>Z</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="Z"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange(event, newValue, 'z')}
                />
            </Box>
        </Box>
    )
}