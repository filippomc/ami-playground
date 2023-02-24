import ViewHelper from "./ViewHelper";

export class SagittalHelper extends ViewHelper{
    constructor(data) {
        super(data)
    }

    translateX(x) {
        console.log("Sagittal: Translate X", x);
    }
}
