import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class SagittalHelper extends ViewHelper{
    constructor(data) {
        super(data)
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay move along the X axis from the sagittal perspective
        const sideLength = this.sideLength / 2 // fixme: distance of the camera to the object seems to be double here I'm not sure why thus the / 2
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(X, pixelsToMove)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay stack helper index change from the sagittal perspective
        const total = this.stackHelper._orientationMaxIndex
        this.stackHelper.index = Math.floor(total * (valuePercentage/2+50) / 100)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay move along the Y axis from the sagittal perspective
        const sideLength = this.sideLength / 2 // fixme: distance of the camera to the object seems to be double here I'm not sure why thus the / 2
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(Y, pixelsToMove)
    }
}
