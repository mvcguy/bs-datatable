import { BSDataTableColDefinition } from "../commonTypes/common-types";
import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableCell extends BSDataTableBase {


    /**
     * @type {boolean}
     */
    isHeader: boolean;
    options: BSDataTableColDefinition;
    /**
     * @param {BSDataTableColDefinition} [options]
     */
    constructor(options: BSDataTableColDefinition, isHeader = false) {
        super();
        this.options = options || new BSDataTableColDefinition();
        this.isHeader = isHeader;
        this.render();
    }

    render() {
        var rowSpan = this.options ? this.options.RowSpan : undefined;
        var colSpan = this.options ? this.options.ColSpan : undefined;

        this.element =
            this.isHeader === true
                ? this.jquery("<th class='sorting ds-col'></th>")
                : this.jquery("<td></td>");

        if (rowSpan)
            this.element.attr('rowSpan', rowSpan);

        if (colSpan)
            this.element.attr('colSpan', colSpan);
    }

    clone() {
        // debugger;
        var sc = super.clone();
        var c = new BSDataTableCell(this.shClone(this.options), this.isHeader);
        c.children = sc.children;
        c.element = sc.element;
        return c;
    }
}
