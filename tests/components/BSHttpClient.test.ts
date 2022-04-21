import { appDataEvents } from "../../src/services/data-events";
import { BSDataTableHttpClient } from "../../src/components";
import { TestHelpers } from "./TestHelpers";
import { BSDataTablePagingMetaData, BSFetchRecordEvent } from "../../src/commonTypes/common-types";

var data = { items: [{ firstName: 'Shahid', country: 'Mars' }], metaData: { pageIndex: 1, pageSize: 10, totalRecords: 100 } };

global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve(data)
})) as jest.Mock;

//
// Alternate solution
//
/*
jest.spyOn(global, "fetch")
    .mockImplementation(jest.fn(() => Promise.resolve({
        json: () => Promise.resolve({ firstName: 'Shahid', country: 'Mars' }),
    })) as jest.Mock)
*/
describe('BSDataTableHttpClient', function () {

    it('verifies httpclient get method', async function () {

        var client = new BSDataTableHttpClient('ds');
        var result = undefined;

        TestHelpers.addHandler(appDataEvents.ON_FETCH_GRID_RECORD, (sender, e: BSFetchRecordEvent) => {
            result = e;
        }, true);
        await client.get({
            url: 'https://fake.com'

        });

        var metaData = new BSDataTablePagingMetaData(data.metaData.pageIndex, data.metaData.pageSize, data.metaData.totalRecords)
        expect(result.EventData.Data).toStrictEqual(data.items);
        expect(result.EventData.MetaData).toStrictEqual(metaData);
    });

    it('verifies that an error event is sent upon invalid response', async function () {
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.reject('operation is invalid')
        })) as jest.Mock;

        var error = undefined;

        var client = new BSDataTableHttpClient('ds');
        TestHelpers.addHandler(appDataEvents.ON_FETCH_GRID_RECORD_ERROR, (sender, e) => {error = e.EventData }, true);

        await client.get({
            url: 'https://fake.com'

        });

        expect(error.Event).toBe('operation is invalid');

    });

})