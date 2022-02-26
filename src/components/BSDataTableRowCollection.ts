import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableRow } from "./BSDataTableRow";

export class BSDataTableRowCollection extends BSDataTableBase {
    /**
     * @type BSDataTableRow[]
     */
    rows: BSDataTableRow[] = [];

    constructor() {
        super();
    }

    /**
     *
     * @param {BSDataTableRow} row
     */
    addRow(row: BSDataTableRow) {
        this.element.append(row.element);
        var index = this.getNextRowIndex();
        row.prop('data-rowindex', index);

        var rType = row.options.gridHeader === true ? 'head' : 'data';
        row.prop('id', `${row.options.gridId}_${rType}_${index}`);
        this.rows.push(row);
        return this;
    }

    getVisibleRows() {
        return this.rows.filter((row) => row.visible === true);
    }

    getNextRowIndex() {
        return this.rows.length + 1;
    }

    // getActionsRow() {
    //     return this.rows.find((row) => row.options.isActionsRow === true);
    // }
    getGridTitlesRow() {
        return this.rows.find((row) => row.options.gridHeader === true);
    }
}
