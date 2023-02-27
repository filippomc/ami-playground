import ViewHelper from "./ViewHelper";
import {Y} from "./constants";

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
}
