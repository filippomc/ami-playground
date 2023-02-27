import ViewHelper from "./ViewHelper";
import {X, Y} from "./constants";

export class SagittalHelper extends ViewHelper{
    constructor(data) {
        super(data)
        // fixme: distance of the camera to the object seems to be double here I'm not sure why thus the / 2
        this.sideLength = this.sideLength / 2
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay move along the X axis from the sagittal perspective
        super.translate(X, valuePercentage)
    }

    translateY(valuePercentage) {
        // Translating the object on the Y axis makes the overlay stack helper index change from the sagittal perspective
        super.updateIndex(valuePercentage)
    }

    translateZ(valuePercentage) {
        // Translating the object on the Z axis makes the overlay move along the Y axis from the sagittal perspective
        super.translate(Y, valuePercentage)
    }

    rotateX(value) {
        super.rotate(value)
    }
    rotateY(value) {

    }
    rotateZ(value) {

    }
}