import ViewHelper from "./ViewHelper";
import {X} from "./constants";

export class SagittalHelper extends ViewHelper{
    constructor(data) {
        super(data)
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay move along the X axis from the sagittal perspective
        const sideLength = this.sideLength
        const pixelsToMove = valuePercentage * sideLength / 100
        super.translate(X, pixelsToMove)
    }
}
