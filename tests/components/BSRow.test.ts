// import { BSDataTableColDefinition } from "src";
import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableRow, BSDataTableSelect } from "../../src/components";

function GetColModel() {
    return {
        address: new BSDataTableColDefinition('Address', 'text', '120px', 'address', false),
        name: new BSDataTableColDefinition('Name', 'text', '120px', 'name', false),
        age: new BSDataTableColDefinition('Age', 'number', '120px', 'age', false),
        dob: new BSDataTableColDefinition('Birth date', 'date', '120px', 'birth_date', false),
        cstatus: new BSDataTableColDefinition('Civil status', 'select', '120px', 'cstatus', false, [{
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
        }])
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
        inputs.birth_date.val = new Date(1920, 4, 4);

        var record: any = row.getRowData();
        expect(record.address).toBe('New lucky street 14B, 2098, Mars');
        expect(record.name).toBe('Shahid Ali');
        expect(record.age).toBe('120');
        expect(record.birth_date).toBe(new Date(1920, 4, 4).toString());
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
        inputs.birth_date.val = new Date(1920, 4, 4);

        var record: any = clone.getRowData();
        expect(record.address).toBe('New lucky street 14B, 2098, Mars');
        expect(record.name).toBe('Shahid Ali');
        expect(record.age).toBe('120');
        expect(record.birth_date).toBe(new Date(1920, 4, 4).toString());
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

    it('verifies the headers row for a given model', function () {
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

    });

});

