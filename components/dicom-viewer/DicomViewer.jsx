import DicomViewerView from "./DicomViewerView";
import {useEffect, useRef, useState} from "react";
import * as AMI from "ami.js";
import {colors, orderSeries} from '../../utils';
import {Box} from "@mui/material";


export default function DicomViewer({mode, files, ...props}) {
    const containerRef = useRef(null);

    const [stacks, setStacks] = useState([])

    useEffect(() => {
        loadModel()
    }, []);

    const loadModel = () => {
        const container = containerRef.current
        const loader = new AMI.VolumeLoader(container); // Shows the progress bar in the container
        loader.load(files).then(() => {
            const series = orderSeries(files, loader.data[0].mergeSeries(loader.data))
            const baseStack = series[0].stack[0];
            const overlayStack = series[1].stack[0];
            setStacks([baseStack, overlayStack])
            loader.free();
        })
    }

    const lutData = {
        lut: 'spectrum',
        lutO: 'linear',
        color: [[0, 0, 0, 0], [1, 1, 1, 1]],
        opacity: [[0, 1], [1, 1]],
    }

    return stacks.length > 0 ? (
        <Box ref={containerRef} sx={{height: "100%"}}>
            <DicomViewerView baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.red}
                             lutData={lutData}/>
        </Box>
    ) : (
        <div>Loading...</div>
    )
}