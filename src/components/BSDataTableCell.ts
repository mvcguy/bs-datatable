import { BSDataTableColDefinition } from "../commonTypes/common-types";
import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableCheckBox } from "./BSDataTableCheckBox";
import { BSDataTableInput } from "./BSDataTableInput";

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
                ? document.createElement('th')
                : document.createElement('td')

        if (this.isHeader) {
            this.element.classList.add('sorting', 'ds-col');
        }
        
        if (rowSpan)
            this.prop('rowSpan', rowSpan);

        if (colSpan)
            this.prop('colSpan', colSpan);
    }

    getCellText(): string | number | boolean | string[] {
        var child = this.children[0];
        if (!child) return "";

        if (child.element instanceof HTMLInputElement) {
            if (child instanceof BSDataTableCheckBox) {
                return child.element.checked + "";
            }
            else if (child instanceof BSDataTableInput) {
                return child.val;
            }
        }

        return child.getText();


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
