import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableSelectListItem } from "../commonTypes/common-types";

export class BSDataTableSelectOption extends BSDataTableBase {
    options: BSDataTableSelectListItem;

    /**
     *
     * @param {BSDataTableSelectListItem} options
     */
    constructor(options: BSDataTableSelectListItem) {
        super();
        this.options = options;
        this.render();
    }

    render() {
        var opt = document.createElement('option');
        opt.value = this.options.value;
        opt.text = this.options.text;
        if (this.options.isSelected)
            opt.selected = true;
        
        this.element = opt;
    }

    clone() {
        var clone = super.clone();
        clone.setText(this.options.text);
        return clone;
    }
}
