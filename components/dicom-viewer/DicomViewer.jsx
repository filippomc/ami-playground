import DicomViewerView from "./DicomViewerView";
import {useEffect, useRef, useState} from "react";
import * as AMI from "ami.js";
import {colors, orderSeries} from '../../utils';
import {Box} from "@mui/material";
import HelpersLut from "ami.js/src/helpers/helpers.lut";
import {axial, coronal, sagittal} from "./constants";
import {viewHelperFactory} from "./ViewHelperFactory";


export default function DicomViewer({mode, files, lutData, onOverlayReady, ...props}) {
    const containerRef = useRef(null);
    const overlaysData = useRef({});

    const [stacks, setStacks] = useState([])
    const [helperLut, setHelperLut] = useState(null)
    const [lutContainerRef, setLutContainerRef] = useState();

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
            onOverlayReady(overlaysData.current)
        })
    }

    useEffect(() => {
        if (lutContainerRef) {
            initLut()
        }
    }, [lutContainerRef]);

    const initLut = () => {
        const {lut, lut0, color, opacity} = lutData
        const helperLut = new HelpersLut(lutContainerRef)
        helperLut.luts = HelpersLut.presetLuts();
        helperLut.lut = lut;
        helperLut.lut0 = lut0;
        helperLut.color = color;
        helperLut.opacity = opacity;
        setHelperLut(helperLut)
    }

    const addOverlayData = (scene, container, stackHelper, orientation) => {
        if (scene && container && stackHelper) {
            const data = {
                scene,
                container,
                stackHelper
            }
            overlaysData.current[orientation] = viewHelperFactory(data, orientation)
        }
    }

    // Orientation is also used as id for the overlay (so that we can use that in the controls)
    return stacks.length > 0 ? (
        <Box ref={containerRef} sx={{height: "100%", width: "100%",}}>
            <Box sx={{
                position: "fixed",
                left: "50%",
                transform: "translate(-50%, 0)",
                zIndex: "3",
                color: "#f9f9f9",
                textAlign: "center"
            }}>
                <Box sx={{position: "relative"}} ref={newRef => setLutContainerRef(newRef)}></Box>
            </Box>
            <Box sx={{height: "100%", display: "flex", flexDirection: "row"}}>
                <DicomViewerView baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.red}
                                 helperLut={helperLut} orientation={axial}
                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, axial)}/>
                <DicomViewerView baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.blue}
                                 helperLut={helperLut} orientation={coronal}
                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, coronal)}/>
                <DicomViewerView baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.green}
                                 helperLut={helperLut} orientation={sagittal}
                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, sagittal)}/>
            </Box>


        </Box>
    ) : (
        <div>Loading...</div>
    )
}