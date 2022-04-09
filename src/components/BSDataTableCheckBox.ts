import { BSDataTableInput } from "./BSDataTableInput";
import { BSInputOptions } from "../commonTypes/common-types";

export class BSDataTableCheckBox extends BSDataTableInput {
    constructor(dataSourceName: string) {
        let options: BSInputOptions = { DataSourceName: dataSourceName, InputType: "checkbox" };
        super(options);
        this.render();
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableCheckBox(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        this.addDoubleClickEvent();
        return c;
    }
}
