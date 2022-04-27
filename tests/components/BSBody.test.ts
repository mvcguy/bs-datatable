import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableBody, BSDataTableCell, BSDataTableRow } from "../../src/components"
import { appDataEvents } from "../../src/services/data-events";
import { TestHelpers } from "./TestHelpers";

function getRow() {
    var row = new BSDataTableRow({
        dataSourceName: 'ds',
        gridId: 'grid',
    });
    var col: BSDataTableColDefinition = {
        DisplayName: 'First Name',
        DataType: 'text',
        Width: '100px',
        PropName: 'firstName',
        DataSourceName: 'ds'
    };
    var cell = new BSDataTableCell(col);
    row.addCell(cell);

    return row;
}

describe('BSDataTableBody', function () {

    it('verifies row siblings method', function () {
        var body = new BSDataTableBody();
        var row1 = new BSDataTableRow({
            dataSourceName: 'ds',
            gridId: 'grid',
        });

        var row2 = new BSDataTableRow({
            dataSourceName: 'ds',
            gridId: 'grid',
        });

        body.addRow(row1);
        body.addRow(row2);

        expect(row1.id).toBe('grid_data_1');
        expect(row2.id).toBe('grid_data_2');

        var sibling = body.rowSiblings(row1)[0];
        expect(sibling.id).toBe('grid_data_2');

        expect(body.element.tagName).toBe('TBODY')

    })

    it('verifies that we get all records using the method: getAllRecords', function () {
        var body = new BSDataTableBody();
        var row = getRow();
        body.addRow(row);

        var input = row.cells[0].getInputControls()[0];
        input.val = 'Shahid Ali';

        var record = body.getAllRecords()[0];

        expect(record.firstName).toBe('Shahid Ali');
        console.log(record);

    });

    it('verifies that we get only dirty records using the method: getDirtyRecords', function () {
        var body = new BSDataTableBody();
        var row = getRow();
        body.addRow(row);

        var row2 = getRow();
        body.addRow(row2);

        var firstName = row.cells[0].getInputControls()[0];
        firstName.val = 'Shahid Ali';
        row.isRowDirty = true;

        var allRecords = body.getAllRecords();
        expect(allRecords.length).toBe(2);

        var dirtyRecords = body.getDirtyRecords();
        expect(dirtyRecords.length).toBe(1);

        expect(dirtyRecords[0].firstName).toBe(firstName.val);

    });

    it('verifies that other rows should not be focused at the same time when one row one is focused', function () {
        var row1 = getRow();
        var row2 = getRow();

        var body = new BSDataTableBody();

        body.addRow(row1).addRow(row2);

        body.focusRow(row1);
        expect(row1.hasClass('table-active')).toBe(true);
        expect(row2.hasClass('table-active')).toBe(false);

        body.focusRow(row2);
        expect(row1.hasClass('table-active')).toBe(false);
        expect(row2.hasClass('table-active')).toBe(true);
    })

    it('verify the template row', function () {
        var row = getRow();
        var row2 = getRow();
        var body = new BSDataTableBody();

        body.addRow(row).addRow(row2);

        row.options.isTemplateRow = true;

        var templRow = body.getTemplateRow();

        expect(templRow.options.isTemplateRow).toBe(true);
    })

    it('verifies a selected row', function () {
        var row1 = getRow();
        var row2 = getRow();

        var body = new BSDataTableBody();

        body.addRow(row1).addRow(row2);

        body.focusRow(row1);

        var selectedRow = body.getSelectedRow();

        expect(selectedRow).toStrictEqual(row1);
    })

    it('verifies a row that is marked for deletion', function () {
        var row1 = getRow();
        var row2 = getRow();
        var body = new BSDataTableBody();
        body.addRow(row1).addRow(row2);
        var rowDeleted = false;

        TestHelpers.addHandler(appDataEvents.ON_GRID_UPDATED, (sender, e) => { rowDeleted = true; }, true);

        //
        // only a selected row is marked for deletion
        //
        body.focusRow(row1);
        body.markDeleted();

        expect(row1.visible).toBe(false);
        expect(row1.rowCategory).toBe('DELETED');

        row2.rowCategory = 'ADDED';
        body.focusRow(row2);
        body.markDeleted();

        expect(row2.visible).toBe(false);
        expect(row2.rowCategory).toBe('ADDED_DELETED');

        expect(rowDeleted).toBe(true);

    })

    it('verifies a row is removed from DOM by removeRow method', function () {
        var row1 = getRow();
        var row2 = getRow();
        var body = new BSDataTableBody();
        body.addRow(row1).addRow(row2);

        expect(body.rows.length).toBe(2);

        var container = document.createElement('table');
        container.append(body.element);

        var rowCount = container.getElementsByClassName('grid-row').length;
        expect(rowCount).toBe(2);

        body.removeRow(row1);
        expect(body.rows.length).toBe(1);

        var rowCount = container.getElementsByClassName('grid-row').length;
        expect(rowCount).toBe(1);
    })


})