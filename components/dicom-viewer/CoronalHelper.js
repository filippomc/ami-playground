import ViewHelper from "./ViewHelper";

export class CoronalHelper extends ViewHelper {
    constructor(data) {
        super(data)
    }

    translateX(valuePercentage) {
        // Translating the object on the X axis makes the overlay stack helper index change from the coronal perspective
        const total = this.stackHelper._orientationMaxIndex
        this.stackHelper.index = Math.floor(total * (valuePercentage/2+50) / 100)
    }
}
