import { BSDataTableInput } from "./BSDataTableInput";
import { BSInputOptions } from "../commonTypes/common-types";

export class BSDataTableSelect extends BSDataTableInput {
    constructor(dataSourceName: string) {
        let options: BSInputOptions = { DataSourceName: dataSourceName, InputType: 'select' };
        super(options);
        this.render();
    }

    set val(v) {
        this.element.val(v);
        this.element.change();
    }

    get val() {
        return this.element.val();
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableSelect(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        this.addDoubleClickEvent();

        return c;
    }
}
