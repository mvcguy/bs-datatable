import { BSDataTable } from "../../src/components";
import { BSDataTableColDefinition, BSDataTableDataSource, BSDataTableOptions, BSDataTablePagingMetaData } from "../../src/commonTypes/common-types";
import { BSFluentBuilder } from "../../src/components/BSFluentBuilder";

describe('BSDataTable', function () {

    it('verifies props of data table component', function () {
        document.body.innerHTML = '<div id="container2"></div>';
        var dt = BSFluentBuilder.CreateBuilder()
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
            .Build()
            .RegisterCallbacks()
            .Render();

        var row = dt.getRowByIndex(2); // position 1 is template row
        console.log(row.getRowData());
        // var records = dt.allRecords;
        // console.log(records);

    })

})