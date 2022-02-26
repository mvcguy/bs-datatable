import { BSDataTableBase } from "./BSDataTableBase";
import { SessionStorageService, appDataEvents } from "../services";
import { BSFetchRecordErrorEvent, BSDataTableHttpClientOptions } from "../commonTypes/common-types";

export class BSDataTableHttpClient extends BSDataTableBase {
    sessionStorage: SessionStorageService;
    cacheResponses: boolean;

    constructor(sessionStorage: SessionStorageService, dataSourceName: string) {
        super();
        this.appDataEvents = appDataEvents;
        this.sessionStorage = sessionStorage;
        this.dataSourceName = dataSourceName;
        this.cacheResponses = false;
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

        var ajaxOptions = {
            url: options.url,
            method: 'GET',
            headers: options.headers ? options.headers : {}
        };
        this.jquery.ajax(ajaxOptions).then(function done(response) {
            if (cache === true) {
                _this.sessionStorage.addItem(key, response, new Date(Date.now() + (10 * 60 * 1000))); // expires in 10 minutes
            }
            _this.notifyResponse(response);

        }, function error(error) {
            _this.nofifyError(error, options);
        });

    };

    notifyResponse(response: any) {
        this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD, { DataSourceName: this.dataSourceName, EventData: { Event: response } });
    }

    nofifyError(error: JQuery.jqXHR<any>, options: BSDataTableHttpClientOptions) {
        let errEvent: BSFetchRecordErrorEvent = { DataSourceName: this.dataSourceName, EventData: { Event: error, RecordId: options.recordId } };
        this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD_ERROR, errEvent);
    }
}
