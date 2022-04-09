import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableSelectListItem, BSInputOptions, BSSelectOptions } from "../commonTypes/common-types";
import { BSDataTableSelectOption } from "./BSDataTableSelectOption";

export class BSDataTableSelect extends BSDataTableInput {

    options: BSSelectOptions;
    constructor(options: BSSelectOptions) {
        options.InputType = 'select';
        super(options);
        this.render();
    }

    render(): void {
        super.render();
        this.options.SelectOptions.forEach((opt) => this.append(new BSDataTableSelectOption(opt)));
        this.addClass('form-select form-select-sm');
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
