import { appDataEvents } from "../../src/services/data-events";
import { dataEventsService } from "../../src/services/data-events-service";
import {
    BSDataTableColDefinition, BSDataTableHttpClientOptions
    , BSDataTablePagingMetaData, BSFetchRecordEvent
} from "../../src/commonTypes/common-types";
import { BSDataTableSelectorWindow } from "../../src/components";
import { BSDataTableHttpClient } from "../../src/components/BSDataTableHttpClient";

let dsName = "selector";
jest.mock('../../src/components/BSDataTableHttpClient', () => {
    return {
        BSDataTableHttpClient: jest.fn().mockImplementation(() => {
            return {
                get: (options: BSDataTableHttpClientOptions) => {
                    // console.log('BSDataTableHttpClientOptions: ', options);
                    var response = {
                        items: [
                            { id: '1', name: 'Car tyres' },
                            { id: '2', name: 'Office chairs' },

                        ],
                        metaData: { pageIndex: 1, pageSize: 3, totalRecords: 1000000 }
                    };
                    var payload: BSFetchRecordEvent = {
                        DataSourceName: dsName + "_StockItem",
                        EventData: {
                            Data: response.items,
                            MetaData: new BSDataTablePagingMetaData(response.metaData.pageIndex, response.metaData.pageSize, response.metaData.totalRecords)
                        }
                    };
                    dataEventsService.Emit(appDataEvents.ON_FETCH_GRID_RECORD, this, payload);
                },
                notifyResponse: (response: any) => {
                    /*private ftn and should not be part of interface*/
                },
                nofifyError: (error: any, options: BSDataTableHttpClientOptions) => {
                    /*private ftn and should not be part of interface*/
                }
            };
        })
    };
});

document.body.innerHTML = '<div id="container"></div>';


describe('BSSelectorWindow', () => {


    const observeMock = {
        observe: (elem: HTMLElement) => null,
        unobserve: () => null,
        disconnect: () => null
    };

    var httpClientMock = jest.mocked(BSDataTableHttpClient, true);

    beforeEach(() => {
        httpClientMock.mockClear();
        (<any>window).IntersectionObserver = () => observeMock;
    });

    it('verify the contents of selector window', () => {

        var selWindow = new BSDataTableSelectorWindow({
            ContainerId: 'container',
            ModelName: 'StockItem',
            UrlCb: (pageIndex) => { return 'http://localhost' },
            GridCols: [
                new BSDataTableColDefinition("Stock item", "text", "60px", "id", true),
                new BSDataTableColDefinition("Description", "text", "220px", "name", false)
            ],
            DataSourceName: dsName
        });

        selWindow.onWindowShown = (sender) => {
            // console.log('Grid records', selWindow.grid.allRecords);

            var records = selWindow.grid.allRecords;
            expect(records.length).toBe(2);

            //
            // verify contents of grid rows
            //

            // { id: '1', name: 'Car tyres' },
            // { id: '2', name: 'Office chairs' },

            var record1 = records[0];
            var record2 = records[1];

            expect(record1.id).toBe('1');
            expect(record1.name).toBe('Car tyres');

            expect(record2.id).toBe('2');
            expect(record2.name).toBe('Office chairs');

            //
            // make sure the text boxes are disabled
            //
            var items = selWindow.grid.body.getVisibleRows();
            expect(items.length).toBe(2);

            var row1 = items[0].getRowDataExt();
            var row2 = items[1].getRowDataExt();

            expect(row1.id.visible).toBe(true);
            expect(row2.id.visible).toBe(true);

            expect(row1.name.visible).toBe(true);
            expect(row2.name.visible).toBe(true);

            expect(row1.id.readonly).toBe(true);
            expect(row2.id.readonly).toBe(true);

            expect(row1.name.readonly).toBe(true);
            expect(row2.name.readonly).toBe(true);

            expect(row1.id.val).toBe('1');
            expect(row2.id.val).toBe('2');

            expect(row1.name.val).toBe('Car tyres');
            expect(row2.name.val).toBe('Office chairs');
        };

        selWindow.show();

    });
});

it('null test', function () { 
    expect(1).toBe(1);
});

