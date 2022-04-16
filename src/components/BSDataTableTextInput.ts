import { BSDataTableInput } from "./BSDataTableInput";
import { BSInputOptions } from "../commonTypes/common-types";

export class BSDataTableTextInput extends BSDataTableInput {
    constructor(options: BSInputOptions) {
        options.InputType = options.InputType ?? 'text';
        super(options);
        this.render();
    }

    render(): void {
        super.render();
        this.addClass(this.options.Classes ?? 'form-control form-control-sm');
        this.placeHolder = this.options.PlaceHolder ?? this.options.ModelName;
    }

    set placeHolder(val: string) {
        if (!val) return;
        if (this.element instanceof HTMLInputElement) {
            this.element.placeholder = val;
        }
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
