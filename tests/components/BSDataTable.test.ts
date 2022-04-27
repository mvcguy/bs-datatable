import { BSDataTable } from "../../src/components";
import { BSDataTableColDefinition, BSDataTableDataSource, BSDataTableOptions, BSDataTablePagingMetaData } from "../../src/commonTypes/common-types";

describe('BSDataTable', function () {

    it('verifies props of data table component', function () {


        document.body.innerHTML = '<div id="container"></div>';
        var cols: BSDataTableColDefinition[] = [];
        var initData = [];

        var totCols = 5, totRows = 30;
        for (let i = 0; i < totCols; i++) {
            cols.push({ DisplayName: "COL-" + i, DataType: "text", Width: "180px", PropName: "col-" + i });

        }

        for (let i = 0; i < totRows; i++) {

            var record = {};
            for (let j = 0; j < totCols; j++) {
                record['col-' + j] = 'DATA-' + i + '-' + j;
            }
            initData.push(record);
        }

        var dataSource: BSDataTableDataSource = {
            name: 'fakeData',
            data: {
                initData,
                metaData: new BSDataTablePagingMetaData(1, 5, totRows)
            }, isRemote: false,
            getPageOfflineCB: (page, data, mdata) => {
                var start = page <= 1 ? 0 : (page - 1) * mdata.pageSize;
                var end = start + mdata.pageSize;
                var maxIndex = data.length - 1;
                if (start > maxIndex || end > maxIndex) return [];
                var pageData = [];
                for (let index = start; index < end; index++) {
                    const element = data[index];
                    pageData.push(element);
                }
                return pageData;
            }
        };

        var bs: BSDataTableOptions = { gridId: "fakeData_table", containerId: "container", colDefinition: cols, dataSource: dataSource };
        bs.enableInfiniteScroll = false;
        var grid = new BSDataTable(bs);
        grid.registerCallbacks();
        grid.render();

        //console.log(grid.element.parentElement.innerHTML);

        var cont = document.getElementById('container');
        var elem = document.createElement('td');
        elem.textContent = 'Hello';

        cont.appendChild(elem);
        //console.log(cont.innerHTML);
    })

})