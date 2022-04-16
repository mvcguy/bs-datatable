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
        //var icon = this.options.Icon ? `<i class="bi bi-${this.options.Icon}"></i>` : '';

        this.addClass(this.options.Classes ?? 'btn btn-outline-primary');
        if (this.options.Icon) {
            var icon = document.createElement('i');
            icon.classList.add('bi', `bi-${this.options.Icon}`);
            this.element.appendChild(icon);
        }

        if (this.options.Handler)
            this.addClickHandler();
    }

    addClickHandler() {
        this.element.addEventListener('click', (e) => this.options.Handler(e));
    }

    clone() {
        var sc = super.clone();
        var btn = new BSDataTableButton(this.shClone(this.options));
        btn.children = sc.children;

        return btn;
    }
}
