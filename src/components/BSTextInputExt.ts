import { BSInputOptions } from "src/commonTypes/common-types";
import { BSDataTableInput } from "./BSDataTableInput";

class BSDataTableTextInputExt extends BSDataTableInput {
    
    constructor(options: BSInputOptions) {
        super(options);
        this.options = options;
        this.render();
    }

    render() {
        this.element = this.jquery(`#${this.options.ElementId}`)
    }
}

export { BSDataTableTextInputExt }
