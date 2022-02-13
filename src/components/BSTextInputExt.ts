import { BSDataTableInput } from "./BSInput";

export class BSDataTableTextInputExt extends BSDataTableInput {
    /**
     * @param {{ inputType: string, elementId: string; dataSourceName:string }} options
     */
    constructor(options) {
        super(options);
        this.options = options;
        this.render();
    }

    render() {
        this.element = this.jquery(`#${this.options.elementId}`)
    }
}
