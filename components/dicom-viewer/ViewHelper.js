import {X, Y} from "./constants";
import {MathUtils} from "three";

export default class ViewHelper {
    constructor(data) {
        const {scene, container, stackHelper} = data
        this.scene = scene;
        this.container = container;
        this.stackHelper = stackHelper;
        this.camera = getCameraFromScene(scene)
        this.sideLength = this._getSideLength()
        this.originalCameraValues = {
            left: this.camera.left,
            right: this.camera.right,
            top: this.camera.top,
            bottom: this.camera.bottom
        }
    }

    _getSideLength() {
        const mesh = this.stackHelper.slice.children[0]
        const vFOV = MathUtils.degToRad( this.camera.fov ); // convert vertical fov to radians
        const distance = this.camera.position.distanceTo(mesh.position);
        return 2 * Math.tan( vFOV / 2 ) * distance * window.devicePixelRatio; // visible height

    }

    translate(axis, valuePercentage) {
        const pixelsToMove = valuePercentage * this.sideLength / 100
        const {style, value} = getStyle(axis, pixelsToMove)
        this.container.style[style] = value
    }

    updateIndex(valuePercentage) {
        // Translating the object on the Y axis makes the overlay stack helper index change from the sagittal perspective
        const total = this.stackHelper._orientationMaxIndex
        this.stackHelper.index = Math.floor(total * (valuePercentage/2+50) / 100)
    }

    rotate(value) {
        this.camera.angle = value
    }

    scale(axis, valuePercentage) {
        const scaleFactor = (valuePercentage / 100) + 0.9999 // fixme using 0.9999 instead of 1 to avoid division by 0

        switch (axis) {
            case X:
                this.camera.left = this.originalCameraValues.left * 1/scaleFactor
                this.camera.right = this.originalCameraValues.right * 1/scaleFactor
                break
            case Y:
                this.camera.top = this.originalCameraValues.top * 1/scaleFactor
                this.camera.bottom = this.originalCameraValues.bottom * 1/scaleFactor
                break

        }
        this.camera.updateProjectionMatrix();
    }
}



function getCameraFromScene(scene) {
    return scene.getObjectByName('overlayCamera');
}



function getStyle(axis, newValue) {
    switch (axis) {
        case X:
            if(newValue < 0) {
                return {style: 'left', value: `${newValue}px`}
            } else {
                return {style: 'left', value: `${newValue}px`}
            }
        case Y:
            if(newValue < 0) {
                return {style: 'top', value: `${newValue*-1}px`}
            } else {
                return {style: 'top', value: `${newValue*-1}px`}
            }
        default:
            return null
    }
}