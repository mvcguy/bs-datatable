import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableCell } from "../../src/components";

function getCell(): BSDataTableColDefinition {
    return { DisplayName: 'First name', DataType: 'text', Width: '120px', PropName: 'firstName', IsKey: false };
}

describe('BSDataTableCell', function () {

    it('verifies props of data-table cell', function () {
        var cellDef = getCell();
        var cell = new BSDataTableCell(cellDef, false);

        var input = cell.getInputControls()[0];
        input.val = 'Shahid Ali';

        expect(input.val).toBe("Shahid Ali");
        expect(input.readonly).toBe(false);
        expect(cell.element.tagName).toBe('TD');
        expect(cell.getCellText()).toBe('Shahid Ali')
    });

    it('verifies a readonly cell', function () {
        var cellDef = getCell();
        cellDef.IsReadOnly = true;
        var cell = new BSDataTableCell(cellDef, false);

        var input = cell.getInputControls()[0];
        expect(input.readonly).toBe(true);
        expect(input.getCss('cursor')).toBe('pointer');
        expect(input.getCss('user-select')).toBe('none');

    });

    it('verifies that a key col is readonly', function () {
        var cellDef = getCell();
        cellDef.IsKey = true;
        var cell = new BSDataTableCell(cellDef, false);

        var input = cell.getInputControls()[0];
        expect(input.readonly).toBe(true);
        expect(input.isKey).toBe(true);

    });

    it('verifies that a header cell has no inputs', function () {
        var cellDef = getCell();
        var cell = new BSDataTableCell(cellDef, true);
        var inputs = cell.getInputControls();

        expect(inputs.length).toBe(0);

        expect(cell.element.tagName).toBe('TH');

        expect(cell.hasClass('sorting')).toBe(true);
        expect(cell.hasClass('ds-col')).toBe(true);
        expect(cell.getText()).toBe('First name');
        expect(cell.getCellText()).toBe('First name');

    });

    it('verifies clone of a cell that has an input control', function () {
        var cellDef = getCell();
        var cell = new BSDataTableCell(cellDef, false);
        var clone = cell.clone();

        var input = clone.getInputControls()[0];
        input.val = 'Shahid Ali';

        expect(input.val).toBe("Shahid Ali");
        expect(input.readonly).toBe(false);
        expect(clone.element.tagName).toBe('TD');
        expect(clone.getCellText()).toBe('Shahid Ali')
    });

    it('verifies clone of a header cell', function () {
        var cellDef = getCell();
        var cell = new BSDataTableCell(cellDef, true);
        var clone = cell.clone();
        var inputs = clone.getInputControls();

        expect(inputs.length).toBe(0);

        expect(clone.element.tagName).toBe('TH');

        expect(clone.hasClass('sorting')).toBe(true);
        expect(clone.hasClass('ds-col')).toBe(true);
        expect(clone.getText()).toBe('First name');
        expect(clone.getCellText()).toBe('First name');

    });



});