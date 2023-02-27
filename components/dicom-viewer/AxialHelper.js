import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class AxialHelper extends ViewHelper {
    constructor(data) {
        super(data);
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay move along the Y axis from the axial perspective
        const sideLength = this.sideLength
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(Y, pixelsToMove)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay move along the X axis from the axial perspective
        const sideLength = this.sideLength
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(X, pixelsToMove)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay stack helper index change from the axial perspective
        const total = this.stackHelper._orientationMaxIndex
        this.stackHelper.index = Math.floor(total * (valuePercentage/2+50) / 100)
    }
}
