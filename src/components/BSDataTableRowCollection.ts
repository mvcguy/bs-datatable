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
        this.append(row);
        var index = this.getNextRowIndex();
        row.rowIndex = index;

        var rType = row.options.gridHeader === true ? 'head' : 'data';
        row.id = `${row.options.gridId}_${rType}_${index}`;
        this.rows.push(row);
        return this;
    }

    getVisibleRows() {
        return this.rows.filter((row) => row.visible === true);
    }

    getNextRowIndex() {
        return this.rows.length + 1;
    }

    getGridTitlesRow() {
        return this.rows.find((row) => row.options.gridHeader === true);
    }
}
