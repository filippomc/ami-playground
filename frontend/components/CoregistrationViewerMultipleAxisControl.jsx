import {Box, Slider, Typography} from "@mui/material";

export default function CoregistrationViewerMultipleAxisControl({title, disabled, min, max, step, defaultValue, onChange}) {
    return (
        <Box>
            <Typography>{title}</Typography>
            <Box>
                <Typography>X</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="X"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange('x',newValue)}
                />
            </Box>
            <Box>
                <Typography>Y</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="Y"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange('y',newValue)}
                />
            </Box>
            <Box>
                <Typography>Z</Typography>
                <Slider min={min} max={max} step={step} defaultValue={defaultValue} aria-label="Z"
                        valueLabelDisplay="auto"
                        disabled={disabled}
                        onChange={(event, newValue) => onChange('z',newValue)}
                />
            </Box>
        </Box>
    )
}