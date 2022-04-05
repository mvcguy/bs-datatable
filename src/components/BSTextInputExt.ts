import { BSInputOptions } from "../commonTypes/common-types";
import { BSDataTableInput } from "./BSDataTableInput";

class BSDataTableTextInputExt extends BSDataTableInput {

    constructor(options: BSInputOptions) {
        super(options);
        this.options = options;
        this.render();
    }

    render() {
        this.element = document.getElementById(this.options.ElementId);
    }
}

export { BSDataTableTextInputExt }
