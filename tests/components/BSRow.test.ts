import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableRow, BSDataTableSelect } from "../../src/components";
import { TestHelpers } from "./TestHelpers";

function GetColModel(): {
    address: BSDataTableColDefinition, name: BSDataTableColDefinition,
    age: BSDataTableColDefinition, dob: BSDataTableColDefinition, cstatus: BSDataTableColDefinition,
} {
    return {
        address: { DisplayName: 'Address', DataType: 'text', Width: '120px', PropName: 'address' },
        name: { DisplayName: 'Name', DataType: 'text', Width: '120px', PropName: 'name' },
        age: { DisplayName: 'Age', DataType: 'number', Width: '120px', PropName: 'age' },
        dob: { DisplayName: 'Birth date', DataType: 'date', Width: '120px', PropName: 'birth_date' },
        cstatus: {
            DisplayName: 'Civil status', DataType: 'select', Width: '120px', PropName: 'cstatus',
            SelectList: [{
                text: 'Single',
                value: 'single',
                isSelected: false
            }, {
                text: 'Married',
                value: 'married',
                isSelected: false
            }, {
                text: 'Divorced',
                value: 'divorced',
                isSelected: false
            }, {
                text: 'Not specified',
                value: 'na',
                isSelected: true
            }]
        }
    };
}

function getRow(idx: number | string): BSDataTableRow {
    var row = new BSDataTableRow({
        dataSourceName: 'row-test' + idx,
        gridId: 'story_books' + idx,
        isTemplateRow: false,
    });

    row.rowCategory = 'PRESTINE';
    row.rowIndex = 1;

    var colModel = GetColModel();

    row.addCell(row.createInputFor(colModel.address, false));
    row.addCell(row.createInputFor(colModel.name, false));
    row.addCell(row.createInputFor(colModel.age, false));
    row.addCell(row.createInputFor(colModel.dob, false));
    row.addCell(row.createInputFor(colModel.cstatus, false));
    return row;
}

describe('BSDataTableRow', function () {

    it('test row properties', function () {

        var row = getRow(1);
        var inputs = row.getRowDataExt();
        inputs.address.val = 'New lucky street 14B, 2098, Mars';
        inputs.name.val = 'Shahid Ali';
        inputs.age.val = 120;

        // month starts from zero in js - very strange?
        inputs.birth_date.val = TestHelpers.toDateDisplayFormat(new Date(1920, 4, 4));

        var record: any = row.getRowData();

        expect(inputs.age.element.type).toBe('number');
        expect(inputs.address.element.type).toBe('text');
        expect(inputs.name.element.type).toBe('text');
        expect(inputs.birth_date.element.type).toBe('date');

        expect(row.element.tagName).toBe('TR');
        expect(record.address).toBe('New lucky street 14B, 2098, Mars');
        expect(record.name).toBe('Shahid Ali');
        expect(record.age).toBe(120);
        expect(record.birth_date).toBe(TestHelpers.toDateDisplayFormat(new Date(1920, 4, 4)));
        expect(record.rowCategory).toBe('PRESTINE');
        expect(record.clientRowNumber).toBe(1);
        expect(record.cstatus).toBe('na');

        row.isRowDirty = true;
        expect(row.isRowDirty).toBe(true);

        inputs.cstatus.val = 'married';
        var record: any = row.getRowData();
        expect(record.cstatus).toBe('married');

        expect(row.hasClass('grid-row')).toBe(true);


        // console.log(record);
    });

    it('verifies the clone of a row', function () {
        var row = getRow(2);
        var clone = row.clone();

        var inputs = clone.getRowDataExt();
        inputs.address.val = 'New lucky street 14B, 2098, Mars';
        inputs.name.val = 'Shahid Ali';
        inputs.age.val = 120;
        inputs.birth_date.val = TestHelpers.toDateDisplayFormat(new Date(1920, 4, 4));

        var record: any = clone.getRowData();
        expect(record.address).toBe('New lucky street 14B, 2098, Mars');
        expect(record.name).toBe('Shahid Ali');
        expect(record.age).toBe(120);
        expect(record.birth_date).toBe(TestHelpers.toDateDisplayFormat(new Date(1920, 4, 4)));
        expect(record.rowCategory).toBe('PRESTINE');
        expect(record.clientRowNumber).toBe(1);

        expect(record.cstatus).toBe('single'); // by default the clone points to the first item in the dropdown

        inputs.cstatus.val = 'married';
        var record: any = clone.getRowData();
        expect(record.cstatus).toBe('married');


    });

    it('verifies visibility of input elements', function () {
        var row = getRow(3);
        var cstatus = row.getVisibleInputs().find((x) => x.options.ModelName === 'cstatus') as BSDataTableSelect;

        expect(cstatus.visible).toBe(true);

        cstatus.visible = false;
        cstatus = row.getVisibleInputs().find((x) => x.options.ModelName === 'cstatus') as BSDataTableSelect;
        expect(cstatus).toBe(undefined);

    });

    it('verifies the header row for a given model', function () {
        var colModel = GetColModel();

        var row = new BSDataTableRow({
            dataSourceName: 'header_test',
            gridId: 'some_grid',
            gridHeader: true,
        });

        row.addCell(row.createHeaderFor(colModel.address));
        row.addCell(row.createHeaderFor(colModel.name));
        row.addCell(row.createHeaderFor(colModel.age));
        row.addCell(row.createHeaderFor(colModel.dob));
        row.addCell(row.createHeaderFor(colModel.cstatus));

        expect(row.hasClass('draggable')).toBe(true);
        expect(row.hasClass('grid-cols')).toBe(true);
        expect(row.cells[0].getText()).toBe('Address');

    });

    it('verifies that a template row is hidden', function () {
        var row = new BSDataTableRow({
            dataSourceName: 'ds',
            gridId: 'grid_1',
            isTemplateRow: true,
        });

        expect(row.getCss('display')).toBe('none');
        expect(row.visible).toBe(false);

    });

    it('verifies that active row has appropriate classes', function () {
        var row = new BSDataTableRow({
            dataSourceName: 'ds',
            gridId: 'grid_1',
            isTemplateRow: true,
        });

        row.focusRow();

        expect(row.hasClass('table-active')).toBe(true);
    });

});

