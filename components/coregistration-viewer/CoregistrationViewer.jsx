import CoregistrationViewerPerspective from "./CoregistrationViewerPerspective";
import {useEffect, useRef, useState} from "react";
import {colors, orderSeries} from '../../utils';
import {Box} from "@mui/material";
import HelpersLut from "ami.js/src/helpers/helpers.lut";
import {StackModel} from "ami.js/src/models/models";
import {axial, coronal, sagittal} from "./constants";
import {viewHelperFactory} from "./controls/helpers/ViewHelperFactory";
const msgpack = require('@msgpack/msgpack');
import * as THREE from 'three';



export default function CoregistrationViewer({mode, files, lutData, onOverlayReady, ...props}) {
    const containerRef = useRef(null);
    const overlaysData = useRef({});

    const [stacks, setStacks] = useState([])
    const [helperLut, setHelperLut] = useState(null)
    const [lutContainerRef, setLutContainerRef] = useState();

    useEffect(() => {
        loadModel()
    }, []);

    const loadModel = () => {
        // Use Promises to load and decode each msgpack file
        const loadMsgPack = url => {
            return fetch(url)
                .then(response => response.arrayBuffer())
                .then(buffer => msgpack.decode(new Uint8Array(buffer)))
                .catch(error => {
                    console.error(`Error loading ${url}: ${error}`);
                });
        };

        // Function to check if an object has x, y, and z properties
        function isVector3Object(obj) {
            return obj && typeof obj === 'object' && 'x' in obj && 'y' in obj && 'z' in obj;
        }

        // Function to populate a ModelsStack instance generically
        function populateModelsStack(decodedData) {
            const stack = new StackModel();

            // Iterate over all properties of the stack
            for (let prop in stack) {
                if (stack.hasOwnProperty(prop) && decodedData.hasOwnProperty(prop)) {
                    if (isVector3Object(decodedData[prop])) {
                        stack[prop] = new THREE.Vector3(decodedData[prop].x, decodedData[prop].y, decodedData[prop].z);
                    } else {
                        stack[prop] = decodedData[prop];
                    }
                }
            }

            return stack;
        }

        // Use Promise.all to ensure all files are loaded and decoded before proceeding
        Promise.all(files.map(loadMsgPack)).then(decodedStacks => {
            // Here, decodedStacks[0] contains the deserialized base stack
            // and decodedStacks[1] contains the deserialized overlay stack.
            const baseStack = populateModelsStack(decodedStacks[0]);
            const overlayStack = populateModelsStack(decodedStacks[1]);

            // Set the state or whatever is required with the deserialized stacks
            setStacks([baseStack, overlayStack]);

            // Call any additional setup or visualization functions
            onOverlayReady(overlaysData.current);
        });
    };


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
                <CoregistrationViewerPerspective baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.red}
                                                 helperLut={helperLut} orientation={axial}
                                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, axial)}/>
                {/*<CoregistrationViewerPerspective baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.blue}*/}
                {/*                                 helperLut={helperLut} orientation={coronal}*/}
                {/*                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, coronal)}/>*/}
                {/*<CoregistrationViewerPerspective baseStack={stacks[0]} overlayStack={stacks[1]} borderColor={colors.green}*/}
                {/*                                 helperLut={helperLut} orientation={sagittal}*/}
                {/*                                 onOverlayReady={(scene, container, stackHelper) => addOverlayData(scene, container, stackHelper, sagittal)}/>*/}
            </Box>


        </Box>
    ) : (
        <div>Loading...</div>
    )
}