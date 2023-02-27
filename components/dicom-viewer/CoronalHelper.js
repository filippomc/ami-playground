import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class CoronalHelper extends ViewHelper {
    constructor(data) {
        super(data)
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay stack helper index change from the coronal perspective
        super.updateIndex(valuePercentage)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay move along the Y axis from the coronal perspective
        super.translate(Y, valuePercentage)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay move along the X axis from the coronal perspective
        super.translate(X, valuePercentage)
    }

    rotateX(value) {

    }
    rotateY(value) {
        super.rotate(value)
    }
    rotateZ(value) {

    }

    scaleX(valuePercentage) {

    }
    scaleY(valuePercentage) {
        super.scale(valuePercentage)
    }
    scaleZ(valuePercentage) {

    }
}
