import { BSDataTablePagingMetaData } from "../../src/commonTypes/common-types";
import { BSFluentBuilder } from "../../src/components/BSFluentBuilder";

function getTable() {
    return BSFluentBuilder.CreateBuilder()
        .SetId('grid2')
        .SetContainerId('container2')
        .SetDataSourceName('Employees')
        .IsRemote(false)
        .EnableInfiniteScroll(false)
        .AddColumn((col) => {
            col.DisplayName = 'First name';
            col.PropName = 'first_name';
        })
        .AddColumn((col) => {
            col.DisplayName = 'Last name';
            col.PropName = 'last_name';
        })
        .AddColumn((col) => {
            col.DisplayName = 'Address';
            col.PropName = 'address';
        })
        .AddInitData((data) => {
            data.initData = [
                { first_name: 'Shahid', last_name: "Khan", address: 'Home' },
                { first_name: 'Wajid', last_name: "Khan", address: 'Home' },
                { first_name: 'Asad', last_name: "Khan", address: 'Home' }
            ];
            data.metaData = new BSDataTablePagingMetaData(1, 10, 3);
        })
}

describe('BSDataTable', function () {

    it('verifies props of data table component', function () {
        document.body.innerHTML = '<div id="container2"></div>';
        var dt = getTable()
            .Build()
            .RegisterCallbacks()
            .Render();
        
        expect(dt.element.tagName).toBe('TABLE')
        expect(dt.hasClasses('table table-bordered table-hover table-sm resizable navTable nowrap bs-table')).toBe(true);

        expect(dt.element.style.width).toBe('inherit');
        expect(dt.element.style.overflow).toBe('hidden');
        expect(dt.getProp('data-datasource')).toBe('Employees');
        expect(dt.element.id).toBe('grid2');

        var header = dt.head;
        expect(header.element.tagName).toBe('THEAD')
        expect(header.hasClass('table-light')).toBe(true);

        expect(dt.head.rows.length).toBe(1);

        var headerRow = dt.head.rows.find(x => x.options.gridHeader === true);
        expect(headerRow.element.tagName).toBe('TR');
        expect(headerRow.hasClasses('draggable grid-cols')).toBe(true);
        expect(headerRow.getProp('data-rowindex')).toBe('1');
        expect(headerRow.element.id).toBe('grid2_head_1')

        var headerCells = headerRow.cells;

        expect(headerCells.length).toBe(4);

        headerCells.forEach(cell => {
            expect(cell.element.tagName).toBe('TH');
            expect(cell.hasClasses('sorting ds-col')).toBe(true);
            expect(cell.element.style.position).toBe('relative');

            // cell contents
            var children = cell.element.children;
            expect(children.length).toBe(2);
            var dragger = children.item(0) as HTMLDivElement;
            var separator = children.item(1) as HTMLDivElement;

            expect(dragger.draggable).toBe(true);
            expect(dragger.classList.contains('grid-header')).toBe(true);

            expect(separator.style.top).toBe('0px');
            expect(separator.style.right).toBe('0px');
            expect(separator.style.width).toBe('5px');
            expect(separator.style.position).toBe('absolute');
            expect(separator.style.cursor).toBe('col-resize');
            expect(separator.style.height).toBe('0px');

            // dragger contains a child which has the actual content
            expect(dragger.children.length).toBe(1);
            expect(dragger.children.item(0).tagName).toBe('DIV');
        });

        var body = dt.body;
        expect(body.element.tagName).toBe('TBODY');

        


    })

    it('verifies input controls of the component', function () {
        // document.body.innerHTML = '<div id="container2"></div>';
        // var dt = getTable()
        //     .Build()
        //     .RegisterCallbacks()
        //     .Render();

        // var records = dt.allRecords;
        // expect(records.length).toBe(3);
        // // console.log(records);
        // //var row = dt.getRowByIndex(2); // position 1 is template row
        // // console.log(row.getRowData());

        // var row = dt.body.rows.find(x => x.getRowDataExt().first_name.val === "Shahid");
        // var shaRow = row.getRowDataExt();

        // shaRow.last_name.val = 'Jan';
        // shaRow.last_name.element.dispatchEvent(new Event('change'));

        // dt.body.focusRow(row);
        // dt.body.markDeleted();

        // // var newRow = dt.addNewRow({ first_name: 'Safia', last_name: 'Khan', address: 'office' }, false);        
        // // dt.body.addRow(newRow);
        // var newRow = dt.addEmptyRow();

        // var rowExt = newRow.getRowDataExt();
        // rowExt.first_name.val = 'Moniba';
        // rowExt.last_name.val = 'Khan';
        // rowExt.address.val = 'Office';

        // dt.body.focusRow(newRow);
        // dt.body.markDeleted();


        // console.log(dt.dirtyRecords);
    })


})