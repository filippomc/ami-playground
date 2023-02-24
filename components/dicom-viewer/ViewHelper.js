export default class ViewHelper {
    constructor(data) {
        const {scene, container, stackHelper} = data
        this.scene = scene;
        this.container = container;
        this.stackHelper = stackHelper;
        this.camera = getCameraFromScene(scene)
    }
}

function getCameraFromScene(scene) {
    return scene.getObjectByName('overlayCamera');
}