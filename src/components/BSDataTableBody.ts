import { BSEvent } from "../commonTypes/common-types";
import { appDataEvents, dataEventsService } from "../services";
import { BSDataTableRow } from "./BSDataTableRow";
import { BSDataTableRowCollection } from "./BSDataTableRowCollection";

export class BSDataTableBody extends BSDataTableRowCollection {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = document.createElement('tbody');
    }

    notifyListeners(eventType: string, payload: BSEvent) {
        dataEventsService.Emit(eventType, this, payload);
    }

    /**
    * @param {BSDataTableRow} row
    */
    rowSiblings(row: BSDataTableRow): BSDataTableRow[] {
        return this.rows.filter((v, i) => {
            if (v !== row)
                return v; // return all except the current row
        });
    }

    /**
     * @param {BSDataTableRow} row
     */
    focusRow(row: BSDataTableRow) {
        //
        // focus current row, and remove focus from previous row
        //
        row.focusRow();
        var siblings = this.rowSiblings(row);
        siblings.forEach((v, i) => v.removeClass('table-active'));
    };

    getTemplateRow(): BSDataTableRow {
        return this.rows.find((v) => v.options.isTemplateRow === true);
    }

    getDirtyRows(): BSDataTableRow[] {
        return this.rows.filter((row) => row.isRowDirty === true);
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

    getAllRecords() {
        //
        // all rows except the template row
        //

        var rows = this.rows.filter((row) => row.options.isTemplateRow !== true);
        var records = [];
        rows.forEach((row) => {
            records.push(row.getRowData());
        });

        return records;
    }

    getSelectedRow(): BSDataTableRow {
        return this.rows.find((v, i) => v.hasClass('table-active') === true);
    }

    markDeleted() {
        var row = this.getSelectedRow();
        if (!row)
            return;

        var siblings = this.rowSiblings(row);
        var lastSibling = siblings[siblings.length - 1];
        row.removeClass('table-active');
        row.isRowDirty = true;
        row.css = { 'display': 'none' };

        var rowCat = row.rowCategory;
        if (rowCat === 'ADDED') {
            row.rowCategory = 'ADDED_DELETED';
        }
        else {
            row.rowCategory = 'DELETED';
        }

        this.notifyListeners(appDataEvents.ON_GRID_UPDATED, { DataSourceName: row.options.dataSourceName, EventData: { Event: row } });

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
