import { BSDataTableBase } from "./BSDataTableBase";
import { SessionStorageService, appDataEvents } from "../services";
import { BSFetchRecordErrorEvent, BSDataTableHttpClientOptions, BSFetchRecordEvent, BSDataTablePagingMetaData, IBSDataTableHttpClient } from "../commonTypes/common-types";

export class BSDataTableHttpClient extends BSDataTableBase implements IBSDataTableHttpClient {
    sessionStorage: SessionStorageService;
    cacheResponses: boolean;

    constructor(sessionStorage: SessionStorageService, dataSourceName: string, cacheResponses: boolean = false) {
        super();
        this.sessionStorage = sessionStorage;
        this.dataSourceName = dataSourceName;
        this.cacheResponses = cacheResponses;
    }


    /**
     * @param {BSDataTableHttpClientOptions} options
     */
    get(options: BSDataTableHttpClientOptions) {
        // debugger;
        var _this = this;
        var cache = _this.cacheResponses;
        if (cache === true) {
            var key = JSON.stringify(options);
            var value = this.sessionStorage.getItem(key);
            if (value) {
                _this.notifyResponse(value);
                return;
            }
        }

        var request = {
            method: 'GET',
            headers: options.headers ? options.headers : {}
        };

        fetch(options.url, request)
            .then(response => response.json())
            .then(data => {
                if (cache === true) {
                    _this.sessionStorage.addItem(key, data, new Date(Date.now() + (10 * 60 * 1000))); // expires in 10 minutes
                }
                _this.notifyResponse(data);
            })
            .catch(error => {
                _this.nofifyError(error, options);
            })

    };

    notifyResponse(response: any) {

        try {
            var fetchRecordEvent: BSFetchRecordEvent = {
                DataSourceName: this.dataSourceName,
                EventData: {
                    Data: response.items,
                    MetaData: new BSDataTablePagingMetaData(response.metaData.pageIndex, response.metaData.pageSize, response.metaData.totalRecords)
                }
            };
        } catch (error) {
            console.log('invalid response. Make sure response have fields: items{array[object]}, metaData {pageIndex, pageSize, totalRecords}');
            return;
        }

        this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD, fetchRecordEvent);
    }

    nofifyError(error: any, options: BSDataTableHttpClientOptions) {
        let errEvent: BSFetchRecordErrorEvent = { DataSourceName: this.dataSourceName, EventData: { Event: error, RecordId: options.recordId } };
        this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD_ERROR, errEvent);
    }
}
