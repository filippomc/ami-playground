import React, { useState } from 'react';
import { Backdrop, CircularProgress } from '@material-ui/core';

function Loader({open}) {
    return (
        <Backdrop open={open} style={{ zIndex: 9999 }}>
            <CircularProgress color="primary" />
        </Backdrop>
    );
}

export default Loader;