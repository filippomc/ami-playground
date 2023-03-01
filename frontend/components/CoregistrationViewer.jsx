import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {SERVER_URL} from "../constants";
import Controls from "./CoregistrationViewerMultipleAxisControl";
import CoregistrationViewerControls from "./CoregistrationControls";


function CoregistrationViewer() {
    const socket = io(SERVER_URL);
    const [images, setImages] = useState([]);

    socket.on('images', (base64Images) => {
        setImages(base64Images);
    });

    useEffect(() => {

        // Send a "start" event to the server to start the image stream
        socket.emit('start');

        return () => socket.disconnect();
    }, []);

    const onControlsChange = (transform, axis, amount) => {
        // todo: add debounce
        socket.emit('transform', transform, axis, amount);
    }

    return (
        <div style={{display: "flex", flexDirection: 'row', alignItems:'center'}}>
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
