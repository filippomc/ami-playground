import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {DEBOUNCE, SERVER_URL} from "../constants";
import Loader from "./Loader";
import {Slider, Typography} from '@material-ui/core';
import {useDebouncedEffect} from "../hooks/useDebouncedEffect";

function CoregistrationViewer() {
    const socket = io(SERVER_URL);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [opacity, setOpacity] = useState(50);
    const [index, setIndex] = useState(0);

    socket.on('images', (base64Images) => {
        setLoading(false)
        setImages(base64Images);
    });

    useDebouncedEffect(() => {
        setLoading(true);
        socket.emit('generate', {slice_index: index, alpha: opacity / 100});
    }, [index, opacity], DEBOUNCE);

    useEffect(() => {
        return () => socket.disconnect();
    }, []);

    return (
        <div style={{display: "flex", flexDirection: 'row', alignItems: 'center'}}>
            <Loader open={loading}/>
            <div>
                <Typography id="opacity-slider" gutterBottom>
                    Opacity
                </Typography>
                <Slider value={opacity} onChange={(e, newValue) => setOpacity(newValue)}
                        aria-labelledby="opacity-slider"/>
                <Typography id="index-slider" gutterBottom>
                    Slice Index
                </Typography>
                <Slider value={index} onChange={(e, newValue) => setIndex(newValue)} aria-labelledby="index-slider"/>
            </div>
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
