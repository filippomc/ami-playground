import {X, Y} from "./constants";
import {Box3, MathUtils, Vector3} from "three";

export default class ViewHelper {
    constructor(data) {
        const {scene, container, stackHelper} = data
        this.scene = scene;
        this.container = container;
        this.stackHelper = stackHelper;
        this.camera = getCameraFromScene(scene)
        this.sideLength = this._getSideLength()
    }

    translate(axis, newValue) {
        const {style, value} = getStyle(axis, newValue)
        this.container.style[style] = value
    }

    _getSideLength() {
        const mesh = this.stackHelper.slice.children[0]
        const vFOV = MathUtils.degToRad( this.camera.fov ); // convert vertical fov to radians
        const distance = this.camera.position.distanceTo(mesh.position);
        return 2 * Math.tan( vFOV / 2 ) * distance * window.devicePixelRatio; // visible height

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