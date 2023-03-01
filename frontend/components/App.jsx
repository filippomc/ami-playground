import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';


const serverURL = 'http://localhost:8000'

const socket = io(serverURL);

export default function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('translate', (res) => {
            console.log(res)
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('translate');
        };
    }, []);

    const translate = () => {
        socket.emit('translate', 10,  (response) => {
            console.log(response);
        } );
    }

    return (
        <div>
            <p>Connected: { '' + isConnected }</p>
            <button onClick={ translate }>Translate</button>
        </div>
    );
}