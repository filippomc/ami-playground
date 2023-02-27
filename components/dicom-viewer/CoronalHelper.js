import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class CoronalHelper extends ViewHelper {
    constructor(data) {
        super(data)
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay stack helper index change from the coronal perspective
        const total = this.stackHelper._orientationMaxIndex
        this.stackHelper.index = Math.floor(total * (valuePercentage/2+50) / 100)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay move along the Y axis from the coronal perspective
        const sideLength = this.sideLength
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(Y, pixelsToMove)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay move along the X axis from the coronal perspective
        const sideLength = this.sideLength
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(X, pixelsToMove)
    }
}
