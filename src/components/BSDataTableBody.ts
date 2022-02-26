import { BSDataTableRow } from "./BSDataTableRow";
import { BSDataTableRowCollection } from "./BSDataTableRowCollection";

export class BSDataTableBody extends BSDataTableRowCollection {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery("<tbody></tbody>");
    }

    /**
    * @param {BSDataTableRow} row
    */
    rowSiblings(row: BSDataTableRow) {
        return this.rows.filter((v, i) => {
            if (v !== row)
                return v; // return all except the current row
        });
    }

    /**
     * @param {BSDataTableRow} row
     */
    focusRow(row: BSDataTableRow) {
        row.removeClass('table-active').addClass('table-active');
        var siblings = this.rowSiblings(row);
        siblings.forEach((v, i) => v.removeClass('table-active'));
    };



    getTemplateRow() {
        var result = this.rows.filter(function (v) {
            if (v.options.isTemplateRow === true)
                return v;
        });

        if (result && result.length > 0)
            return result[0];
    }

    getDirtyRows() {
        var rows = this.rows.filter((v, i) => v.isRowDirty());
        return rows;
    }

    getDirtyRecords() {
        var dirtyRows = this.getDirtyRows();

        if (dirtyRows.length === 0) {
            return [];
        }
        var records = [];
        dirtyRows.forEach((row, i) => {
            records.push(row.getRowData());
        });

        return records;
    }

    getSelectedRow() {
        return this.rows.find((v, i) => v.hasClass('table-active'));
    }


    markDeleted() {
        var row = this.getSelectedRow();
        if (!row)
            return;

        var siblings = this.rowSiblings(row);
        var lastSibling = siblings[siblings.length - 1];
        row.removeClass('table-active');
        row.prop('data-isdirty', 'true');
        row.css = { 'display': 'none' };

        var rowCat = row.rowCategory;
        if (rowCat === 'ADDED') {
            row.rowCategory = 'ADDED_DELETED';
        }
        else {
            row.rowCategory = 'DELETED';
        }

        this.notifyListeners(this.appDataEvents.ON_GRID_UPDATED, { DataSourceName: row.options.dataSourceName, EventData: { Event: row } });

        this.focusRow(lastSibling);
    }

    /**
     * Removes the row from rows collection
     * @param {BSDataTableRow} row
     */
    removeRow(row: BSDataTableRow) {

        // this.find(`tr[data-rowcategory='${row.rowCategory}']`).remove();
        row.element.remove();

        var index = this.rows.indexOf(row);
        if (index > -1)
            this.rows.splice(index, 1);
    }
}
