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
        var optClone:BSSelectOptions = this.shClone(this.options);
        optClone.SelectOptions = this.shClone(this.SelectOptions);
        
        var c = new BSDataTableSelect(optClone);
        c.element = sc.element;
        c.children = sc.children;
        this.addDoubleClickEvent();

        return c;
    }
}
