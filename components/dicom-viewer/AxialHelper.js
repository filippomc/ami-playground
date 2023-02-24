import ViewHelper from "./ViewHelper";

export class AxialHelper extends ViewHelper{
    constructor(data) {
        super(data);
    }
    translateX(x) {
        console.log("Axial: Translate X", x);
    }
}
