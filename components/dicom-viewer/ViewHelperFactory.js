import {axial, coronal, sagittal} from "./constants";
import {AxialHelper} from "./AxialHelper";
import {SagittalHelper} from "./SagittalHelper";
import {CoronalHelper} from "./CoronalHelper";

export const viewHelperFactory = (data, orientation) => {
    switch (orientation) {
        case axial:
            return new AxialHelper(data)
        case sagittal:
            return new SagittalHelper(data)
        case coronal:
            return new CoronalHelper(data)
    }
    return null
}