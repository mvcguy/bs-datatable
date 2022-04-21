import { BSDataTableBase } from "./BSDataTableBase";
import { SessionStorageService, appDataEvents, dataEventsService } from "../services";
import { BSFetchRecordErrorEvent, BSDataTableHttpClientOptions, BSFetchRecordEvent, BSDataTablePagingMetaData, IBSDataTableHttpClient, BSEvent } from "../commonTypes/common-types";

export class BSDataTableHttpClient extends BSDataTableBase implements IBSDataTableHttpClient {
    sessionStorage: SessionStorageService;
    enableCaching: boolean;

    constructor(dataSourceName: string, enableCaching: boolean = false) {
        super();
        this.sessionStorage = new SessionStorageService();
        this.dataSourceName = dataSourceName;
        this.enableCaching = enableCaching;
    }

    notifyListeners(eventType: string, payload: BSEvent) {
        dataEventsService.Emit(eventType, this, payload);
    }

    get(options: BSDataTableHttpClientOptions) {
        // debugger;
        var _this = this;
        var cache = _this.enableCaching;
        if (cache === true) {
            var key = JSON.stringify(options);
            var value = this.sessionStorage.getItem(key);
            if (value) {
                _this.notifyResponse(value, options);
                return Promise.resolve();
            }
        }

        var request = {
            method: options.method ?? 'GET',
            headers: options.headers ? options.headers : {}
        };

        return fetch(options.url, request)
            .then(response => response.json())
            .then(data => {
                if (cache === true) {
                    _this.sessionStorage.addItem(key, data, new Date(Date.now() + (10 * 60 * 1000))); // expires in 10 minutes
                }
                _this.notifyResponse(data, options);
            })
            .catch(error => {
                _this.notifyError(error, options);
            })

    };

    notifyResponse(response: any, options: BSDataTableHttpClientOptions) {

        try {
            var fetchRecordEvent: BSFetchRecordEvent = {
                DataSourceName: this.dataSourceName,
                EventData: {
                    Data: response.items,
                    MetaData: new BSDataTablePagingMetaData(response.metaData.pageIndex, response.metaData.pageSize, response.metaData.totalRecords)
                }
            };
        } catch (error) {
            var reason = 'invalid response. Make sure response have fields: items{array[object]}, metaData {pageIndex, pageSize, totalRecords}';
            // console.log(reason);
            this.notifyError(reason, options);
            return;
        }

        this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD, fetchRecordEvent);
    }

    notifyError(error: any, options: BSDataTableHttpClientOptions) {
        let errEvent: BSFetchRecordErrorEvent = { DataSourceName: this.dataSourceName, EventData: { Event: error, RecordId: options.recordId } };
        this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD_ERROR, errEvent);
    }
}
