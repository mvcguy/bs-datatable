import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableSelectListItem, BSSelectOptions } from "../commonTypes/common-types";
import { BSDataTableSelectOption } from "./BSDataTableSelectOption";

export class BSDataTableSelect extends BSDataTableInput {

    SelectOptions: BSDataTableSelectListItem[];
    constructor(options: BSSelectOptions) {
        super({ DataSourceName: options.DataSourceName, InputType: 'select' });
        this.SelectOptions = options.SelectOptions;
        this.render();
    }

    render(): void {
        super.render();
        this.SelectOptions.forEach((opt) => this.append(new BSDataTableSelectOption(opt)));
        this.addClass('form-select form-select-sm');
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableSelect(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        c.SelectOptions = this.shClone(this.SelectOptions);
        this.addDoubleClickEvent();

        return c;
    }
}
