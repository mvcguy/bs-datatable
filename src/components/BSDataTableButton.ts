import { BSDataTableInput } from "./BSDataTableInput";
import { BSButtonOptions } from "../commonTypes/common-types";

export class BSDataTableButton extends BSDataTableInput {

    options: BSButtonOptions;

    constructor(options: BSButtonOptions) {
        options.InputType = 'button';
        super(options);
        this.options = options;
        this.render();
    }

    render() {
        super.render();

        this.addClass(this.options.Classes ?? 'btn btn-outline-primary');
        if (this.options.Icon) {
            var icon = document.createElement('i');
            icon.classList.add('bi', `bi-${this.options.Icon}`);
            this.element.appendChild(icon);
        }

        if (this.options.Handler)
            this.addClickHandler(this.options.Handler);
    }

    addClickHandler(handler: (arg0: MouseEvent) => void) {
        this.element.addEventListener('click', (e) => handler(e));
    }

    clone() {
        var sc = super.clone();
        var btn = new BSDataTableButton(this.shClone(this.options));
        btn.children = sc.children;

        return btn;
    }
}
