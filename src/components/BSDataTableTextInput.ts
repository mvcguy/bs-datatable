import { BSDataTableInput } from "./BSDataTableInput";
import { BSInputOptions } from "src/commonTypes/common-types";

export class BSDataTableTextInput extends BSDataTableInput {
    constructor(dataSourceName: string, inputType: string = "text") {
        let options: BSInputOptions = { DataSourceName: dataSourceName, InputType: inputType };
        super(options);
        this.render();
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableTextInput(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        c.addDoubleClickEvent();
        return c;
    }
}
