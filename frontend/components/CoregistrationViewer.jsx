import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {DEBOUNCE, POSITION, ROTATION, SCALE, SERVER_URL} from "../constants";
import CoregistrationViewerControls from "./CoregistrationControls";
import {useDebouncedEffect} from "../hooks/useDebouncedEffect";


function CoregistrationViewer() {
    const socket = io(SERVER_URL);
    const [images, setImages] = useState([]);
    const [positionTransform, setPositionTransform] = useState(null)
    const [rotationTransform, setRotationTransform] = useState(null)
    const [scaleTransform, setScaleTransform] = useState(null)

    socket.on('images', (base64Images) => {
        setImages(base64Images);
    });

    useEffect(() => {

        // Send a "start" event to the server to start the image stream
        socket.emit('start');

        return () => socket.disconnect();
    }, []);

    const onControlsChange = (transform, axis, amount) => {
        switch (transform) {
            case SCALE:
                setScaleTransform({axis, amount})
                break;
            case ROTATION:
                setRotationTransform({axis, amount})
                break;
            case POSITION:
                setPositionTransform({axis, amount})
                break;
        }
    }

    useDebouncedEffect(() => scaleTransform && socket.emit('transform', SCALE, scaleTransform.axis, scaleTransform.amount),
        [scaleTransform], DEBOUNCE);
    useDebouncedEffect(() => rotationTransform && socket.emit('transform', ROTATION, rotationTransform.axis, rotationTransform.amount),
        [rotationTransform], DEBOUNCE);
    useDebouncedEffect(() => positionTransform && socket.emit('transform', POSITION, positionTransform.axis, positionTransform.amount),
        [positionTransform], DEBOUNCE);


    return (
        <div style={{display: "flex", flexDirection: 'row', alignItems: 'center'}}>
            <CoregistrationViewerControls onChange={onControlsChange}/>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {images.map((base64Image, index) => (
                    <img src={`data:image/jpeg;base64,${base64Image}`}
                         alt={`Image ${index + 1}`} key={index} style={{maxWidth: `${100 / images.length}%`}}/>
                ))}
            </div>
        </div>

    );
}

export default CoregistrationViewer;
