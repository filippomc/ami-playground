import ViewHelper from "./ViewHelper";

export class CoronalHelper extends ViewHelper {
    constructor(data) {
        super(data)
    }

    translateX(x) {
        console.log("Coronal: Translate X", x);
    }
}
