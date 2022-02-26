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
        this.element = this.jquery("<option></option>");
        this.element.val(this.options.value);
        this.element.text(this.options.text);

        if (this.options.isSelected)
            this.element.attr('selected', 'selected');
    }

    clone() {
        var clone = super.clone();
        clone.setText(this.element.text());
        return clone;
    }
}
