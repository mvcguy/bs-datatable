import { BSInput } from "./BSInput";

export class BSTextInputExt extends BSInput {
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
