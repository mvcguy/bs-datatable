import { BSDataTableHyperLinkOptions } from "../commonTypes/common-types";
import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableHyperLink extends BSDataTableBase {
    options: BSDataTableHyperLinkOptions;
    constructor(options: BSDataTableHyperLinkOptions) {        
        super();
        this.options = options;
        this.render();
    }

    render() {
        var elem = document.createElement('a');
        
        if (this.options.text) {
            elem.text = this.options.text;
        }

        if (this.options.href) {
            elem.href = this.options.href;
        }

        this.element = elem;

        if (this.options.classes)
            this.addClass(this.options.classes);
        
        if (this.options.clickHandler) {
            this.element.addEventListener('click', this.options.clickHandler);
        }
    }
}