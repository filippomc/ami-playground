import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class AxialHelper extends ViewHelper {
    constructor(data) {
        super(data);
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay move along the Y axis from the axial perspective
        super.translate(Y, valuePercentage)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay move along the X axis from the axial perspective
        super.translate(X, valuePercentage)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay stack helper index change from the axial perspective
        super.updateIndex(valuePercentage)
    }
}
