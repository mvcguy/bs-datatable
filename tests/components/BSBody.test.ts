import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableBody, BSDataTableCell, BSDataTableRow } from "../../src/components"

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

})