import {
    BSDataTableColDefinition, BSDataTableHttpClientOptions,
    BSDataTablePagingMetaData, BSFetchRecordEvent, BSSelectorOptions
} from '../../src/commonTypes/common-types';

import { appDataEvents, dataEventsService } from '../../src/services';
import { BSDataTableSelector, BSDataTableHttpClient } from '../../src/components'


let dsName = "selector";
document.body.innerHTML = '<div id="container"></div>';

function getSelectorOptions(): BSSelectorOptions {
    return {
        DataSourceName: dsName,
        ModelName: 'inventoryId',
        ElementId: 'selInventoryId',
        InputType: "text",
        PlaceHolder: 'Inventory ID',
        ContainerId: "container",
        UrlCb: (pageIndex) => { return 'http://localhost' },
        GridCols: [
            new BSDataTableColDefinition("Stock item", "text", "60px", "id", true),
            new BSDataTableColDefinition("Description", "text", "220px", "name", false)
        ],
    }
}

jest.mock('../../src/components/BSDataTableHttpClient', () => {
    return {
        BSDataTableHttpClient: jest.fn().mockImplementation(() => {
            return {
                get: (options: BSDataTableHttpClientOptions) => {
                    console.log('BSDataTableHttpClientOptions: ', options, 'DSName: ', dsName);
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

describe('xxx', function () {

    const observeMock = {
        observe: (elem: HTMLElement) => null,
        unobserve: () => null,
        disconnect: () => null
    };

    var httpClientMock = jest.mocked(BSDataTableHttpClient, true);

    beforeEach(() => {
        httpClientMock.mockClear();
        (<any>window).IntersectionObserver = () => observeMock;
        document.body.innerHTML = '<div id="container"></div>';
        console.log('cleaning used resources...');
    });

    // it('test selector values', () => {

    //     let options = getSelectorOptions();
    //     const inventoryId = new BSDataTableSelector(options);

    //     expect(inventoryId.txtElement.readonly).toBe(false);

    //     inventoryId.txtElement.val = "VAR001";
    //     expect(inventoryId.txtElement.val).toBe("VAR001");

    //     inventoryId.txtElement.disabled = true;
    //     inventoryId.txtElement.isKey = true;

    //     expect(inventoryId.txtElement.options.ModelName).toBe('inventoryId');
    //     expect(inventoryId.txtElement.disabled).toBe(true);
    //     expect(inventoryId.txtElement.isKey).toBe(true);

    //     //
    //     // verify that a wrapper exist around the text box and the selector button
    //     //
    //     var parent = inventoryId.txtElement.element.parentElement;
    //     expect(parent.tagName).toBe('DIV');
    //     expect(parent.classList.contains('input-group')).toEqual(true);
    //     expect(parent.classList.contains('input-group-sm')).toEqual(true);

    //     expect(parent).toEqual(inventoryId.btnElement.element.parentElement);
    //     expect(inventoryId.element).toEqual(parent);

    // });

    // it('tests clone of the select component', () => {
    //     let options = getSelectorOptions();
    //     const inventoryId = new BSDataTableSelector(options);
    //     var clone = inventoryId.clone();

    //     expect(clone.txtElement.readonly).toBe(false);

    //     clone.txtElement.val = "VAR001";
    //     expect(clone.txtElement.val).toBe("VAR001");

    //     clone.txtElement.disabled = true;
    //     clone.txtElement.isKey = true;

    //     expect(clone.txtElement.options.ModelName).toBe('inventoryId');
    //     expect(clone.txtElement.disabled).toBe(true);
    //     expect(clone.txtElement.isKey).toBe(true);

    //     //
    //     // verify that a wrapper exist around the text box and the selector button
    //     //
    //     var parent = clone.txtElement.element.parentElement;
    //     expect(parent.tagName).toBe('DIV');
    //     expect(parent.classList.contains('input-group')).toEqual(true);
    //     expect(parent.classList.contains('input-group-sm')).toEqual(true);
    //     expect(parent).toEqual(clone.btnElement.element.parentElement);
    //     expect(clone.element).toEqual(parent);
    // });

    it('verify the contents of selector window', () => {

        let options = getSelectorOptions();
        // options.ModelName = options.ModelName + "_1";
        dsName = options.DataSourceName + "_" + options.ModelName;

        const inventoryId = new BSDataTableSelector(options);

        inventoryId.selectorWindow.onWindowShown = (sender) => {
            // console.log('Grid records', selWindow.grid.allRecords);

            var records = sender.grid.allRecords;
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
            var items = sender.grid.body.getVisibleRows();
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


        //
        // click the selector button to show the window
        //
        inventoryId.btnElement.element.dispatchEvent(new Event('click'));

        //inventoryId.selectorWindow.show();

    });

    
it('null test', function () { 
    expect(1).toBe(1);
});


});



