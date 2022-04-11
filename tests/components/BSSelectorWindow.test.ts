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
                    console.log('BSDataTableHttpClientOptions: ', options);
                    var response = {
                        items: [
                            { id: '1', name: 'Car tyres' },
                            { id: '2', name: 'Office chairs' },

                        ],
                        metaData: { pageIndex: 1, pageSize: 3, totalRecords: 1000000 }
                    };
                    var payload: BSFetchRecordEvent = {
                        DataSourceName: dsName,
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

document.body.innerHTML =
    '<div id="container"></div>';


describe('BSSelectorWindow', () => {


    const observeMock = {
        observe: (elem: HTMLElement) => null,
        unobserve: () => null,
        disconnect: () => null // maybe not needed
    };

    var httpClientMock = jest.mocked(BSDataTableHttpClient, true);

    beforeEach(() => {
        httpClientMock.mockClear();
        (<any>window).IntersectionObserver = () => observeMock;
    });

    it('verify the contents of selector window', () => {

        var selWindow = new BSDataTableSelectorWindow({
            ContainerId: 'container',
            PropName: 'stock_items',
            UrlCb: (pageIndex) => { return 'http://localhost' },
            GridCols: [
                new BSDataTableColDefinition("Stock item", "text", "60px", "id", true),
                new BSDataTableColDefinition("Description", "text", "220px", "name", false)
            ],
            DataSourceName: dsName
        });

        selWindow.show();
        console.log('Grid records', selWindow.grid.allRecords);
    });
});

