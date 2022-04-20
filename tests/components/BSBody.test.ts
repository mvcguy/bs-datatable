import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableBody, BSDataTableCell, BSDataTableRow } from "../../src/components"

function getRow() {
    var row = new BSDataTableRow({
        dataSourceName: 'ds',
        gridId: 'grid',
    });
    var cell = new BSDataTableCell(new BSDataTableColDefinition('First Name', 'text', '100px', 'firstName'));
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


        // var cell = new BSDataTableCell(new BSDataTableColDefinition('Name', 'text', '100px', 'name'));
        // row.addCell(cell);

        // var recs = body.getAllRecords();
        // var l = recs.length;
        // console.log(recs, l);

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

})