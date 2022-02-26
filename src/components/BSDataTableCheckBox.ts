import { BSDataTableInput } from "./BSDataTableInput";
import { BSInputOptions } from "../commonTypes/common-types";

export class BSDataTableCheckBox extends BSDataTableInput {
    constructor(dataSourceName: string) {
        let options: BSInputOptions = { DataSourceName: dataSourceName, InputType: "checkbox" };
        super(options);
        this.render();
    }

    get val() {
        var val = this.element.is(':checked');
        return val === true ? "true" : "false";
    }

    /**
     * @param {string} v
     */
    set val(v: string) {
        this.element.val(v);
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
