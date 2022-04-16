// import { BSDataTableColDefinition } from "src";
import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableRow } from "../../src/components";

describe('BSDataTableRow', function () {


    it('test row properties', function () {
        var row = new BSDataTableRow({
            dataSourceName: 'row-test',
            gridId: 'story_books',
            isTemplateRow: false,
        });

        row.rowCategory = 'PRESTINE';
        row.rowIndex = 1;

        var colModel = {
            address: new BSDataTableColDefinition('Address', 'text', '120px', 'address', false),
            name: new BSDataTableColDefinition('Name', 'text', '120px', 'name', false),
            age: new BSDataTableColDefinition('Age', 'number', '120px', 'age', false),
            dob: new BSDataTableColDefinition('Birth date', 'date', '120px', 'birth_date', false),
        }

        row.addCell(row.createInputFor(colModel.address, false));
        row.addCell(row.createInputFor(colModel.name, false));
        row.addCell(row.createInputFor(colModel.age, false));
        row.addCell(row.createInputFor(colModel.dob, false));

        var inputs = row.getRowDataExt();

        inputs.address.val = 'New lucky street 14B, 2098, Mars';
        inputs.name.val = 'Shahid Ali';
        inputs.age.val = 120;
        inputs.birth_date.val = new Date(1920, 4, 4);

        var record: any = row.getRowData();

        expect(record.address).toBe('New lucky street 14B, 2098, Mars');
        expect(record.name).toBe('Shahid Ali');
        expect(record.age).toBe('120');
        expect(record.birth_date).toBe(new Date(1920, 4, 4).toString())

        console.log(record);

    });

});