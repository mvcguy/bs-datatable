
export interface BSEventHandler { (sender: object, eventObject: BSEvent): void }

export interface BSEvent {
    EventData?: { Event?: any };
    DataSourceName: string;
}

export interface BSSortingRequestEvent extends BSEvent {
    EventData?: {
        Event?: any,
        PropName?: string,
        Asc?: boolean
    }
}

export interface BSColsReorderedEvent extends BSEvent {
    EventData?: {
        Event?: any,
        CurrentCol?: object,
        Asc?: boolean
    }
}

export interface BSConfigUpdatedEvent extends BSEvent {
    EventData?: {
        Event?: any,
        Action?: string,
        CurrentCol?: object,
        Asc?: boolean
    }
}

export interface BSFetchRecordErrorEvent extends BSEvent {
    EventData?: {
        Event?: any,
        RecordId?: string
    }
}

export interface BSFetchRecordEvent extends BSEvent {
    EventData?: {
        Data?: any,
        MetaData?: BSDataTablePagingMetaData
        Event?: any
    }
}

export interface BSGridUpdatedEvent extends BSEvent {
    EventData?: {
        Grid?: object,
        Event?: any
    }
}

export interface BSRowUpdatedEvent extends BSEvent {
    EventData?: {
        Row?: any,
        Event?: any
    }
}

export interface BSFieldUpdatedEvent extends BSEvent {
    EventData?: {
        Row?: any,
        Event?: any,
        Field?: object
    }
}

export interface BSWinPopEvent extends BSEvent {
    SkipPush: boolean
}
export interface BSEventSubscriberModel {
    Key: string,
    EventName: string,
    Callback?: BSEventHandler,
    DataSourceName: string,
    VerifyDataSourceName?: boolean
}


/**
 * Url CB type
 * @callback getUrlCallback
 * @param {number} pageIndex
 * @returns {string} url to access next page
 */
export interface getUrlCallback { (pageIndex: number): string };

// TODO: Fix the options for the base class BSDataTableInput and all its childs

export interface BSInputOptions {
    DataSourceName: string;
    InputType?: string;
    ElementId?: string;

    /**
     * Space separated list of css classes
     */
    Classes?: string;
    PlaceHolder?: string;
    ModelName?: string;
    Title?: string;

}

export interface BSSelectOptions extends BSInputOptions {
    SelectOptions: BSDataTableSelectListItem[]
}

export interface BSButtonOptions extends BSInputOptions {
    Icon?: string;
    Handler?: (arg0: MouseEvent) => void;
}

export interface BSSelectorOptions extends BSSelectorWindowOptions {
    cloneContext?: boolean;    
}

export interface BSSelectorWindowOptions extends BSInputOptions {
    ContainerId: string;
    UrlCb: getUrlCallback;
    GridCols?: BSDataTableColDefinition[];
}

export class BSDataTableSelectListItem {
    text: string;
    value: string;
    isSelected?: boolean;

    /**
     * @param {string} text
     * @param {string} value
     * @param {boolean} isSelected
     */
    constructor(text: string, value: string, isSelected: boolean = false) {
        this.text = text;
        this.value = value;
        this.isSelected = isSelected;
    }

}

export class BSDataTableColDefinition {
    /**
     * Display name
     */
    Name: string;
    DataType: string;
    Width: string;

    /**
     * variable name - must not contain spaces
     */
    PropName: string;
    IsKey: boolean;
    /**
     * The options of a select list/dropdown
     */
    SelectList: BSDataTableSelectListItem[];
    ColSpan: number;
    RowSpan: number;

    /**
     * The URL to get the data for a selector 
     * Selector displays data in a grid where needs to be bind to some tabuler data
     */
    SelectorDataCB: getUrlCallback;

    /**
     * The column list of the grid displayed in the selector window
     */
    SelectorCols: BSDataTableColDefinition[];

    constructor(name?: string, dataType?: string, width?: string, propName?: string, isKey?: boolean,
        selectList?: BSDataTableSelectListItem[], colSpan?: number, rowSpan?: number,
        selectorDataCB?: getUrlCallback, selectorCols?: BSDataTableColDefinition[]) {
        this.Name = name;
        this.DataType = dataType;
        this.Width = width;
        this.PropName = propName;
        this.IsKey = isKey;
        this.SelectList = selectList;
        this.ColSpan = colSpan;
        this.RowSpan = rowSpan;
        this.SelectorDataCB = selectorDataCB;
        this.SelectorCols = selectorCols;
    }
}


/**
 * A callback type to get the next page in the offline mode
 * @callback getNextPageOffline
 * @param {number} pageIndex
 * @param {object[]} data - dataset
 * @param {BSDataTablePagingMetaData} metadata - dataseta metadata
 * @returns {object[]} returns the data model for the request page
 */

interface getNextPageOffline { (pageIndex: number, data: object[], metaData: BSDataTablePagingMetaData): object[] };




export class BSDataTableDataSource {
    name: any;
    data: any;
    isRemote: any;
    url: (page: any) => any;
    getPageOfflineCB: any;


    /**
     * @param {string} name
     * @param {{initData: object[];metaData: BSDataTablePagingMetaData;}} initData
     * @param {boolean} isRemote
     * @param {getUrlCallback} url - A cb that will accept a page number and returns the url to the next page
     * @param {getNextPageOffline} getPageOffline - A callback type to get the next page in the offline mode
     */
    constructor(name: string, initData: { initData: object[]; metaData: BSDataTablePagingMetaData; },
        isRemote: boolean, url: getUrlCallback = (page) => undefined, getPageOffline: getNextPageOffline = undefined) {
        this.name = name;
        this.data = initData;
        this.isRemote = isRemote;
        this.url = url;
        this.getPageOfflineCB = getPageOffline;
    }

}

export class BSDataTableOptions {
    gridId: string;
    containerId: string;
    colDefinition: BSDataTableColDefinition[];
    dataSource: BSDataTableDataSource;
    isReadonly: boolean;
    enableInfiniteScroll: boolean;
    cacheResponses: boolean;
    httpClient: IBSDataTableHttpClient;

    constructor(gridId: string, containerId: string,
        colDefinition: BSDataTableColDefinition[], dataSource: BSDataTableDataSource, isReadonly: boolean = false) {
        this.gridId = gridId;
        this.containerId = containerId;
        this.colDefinition = colDefinition;
        this.dataSource = dataSource;
        this.isReadonly = isReadonly;
        this.enableInfiniteScroll = true;
        this.cacheResponses = false;
    }
}

export class BSDataTablePagingMetaData {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    /**
     * @param {number} pageIndex
     * @param {number} pageSize
     * @param {number} totalRecords
     */
    constructor(pageIndex: number = 1, pageSize: number = 10, totalRecords: number = 10) {
        this.pageIndex = pageIndex;
        this.pageSize = !pageSize || pageSize <= 0 ? 10 : pageSize;
        this.totalRecords = totalRecords;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    }
}


export class BSDataTablePaginationOptions {
    dsName: any;
    pagingMetaData: any;
    nextPageCallback: (page: any) => void;

    /**
     * @param {string} dsName
     * @param {BSDataTablePagingMetaData} pagingMetaData
     */
    constructor(dsName: string, pagingMetaData: BSDataTablePagingMetaData, nextPageCallback = (page: number) => { }) {
        this.dsName = dsName;
        this.pagingMetaData = pagingMetaData;
        this.nextPageCallback = nextPageCallback;
    }
}


export class BSDataTableHttpClientOptions {
    url: any;
    method: any;
    headers: any;
    recordId: any;

    /**
     * @param {string} url
     * @param {string} method
     * @param {object[]} headers
     * @param {string} recordId
     */
    constructor(url: string, method: string, headers: object[] = undefined, recordId: string = undefined) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.recordId = recordId;
    }
}


// export class BSDataTableColSettings {
//     width: string;
//     visible: boolean;
//     sort: string;
//     position: number;
//     /**
//      * @param {string} width
//      * @param {boolean} visible
//      * @param {string} sort asc|desc
//      * @param {number} position
//      */
//     constructor(width: string, visible: boolean, sort: string, position: number) {
//         this.width = width;
//         this.visible = visible;
//         this.sort = sort;
//         this.position = position;
//     }
// }

export interface BSColumnSettings {
    Width: string
    Visible: boolean
    Ascending: boolean
    Position: number
}

export interface BSRowOptions {
    dataSourceName: string;
    gridId: string;
    gridHeader?: boolean;
    isTemplateRow?: boolean;
    containerId?: string;
}

export interface ISessionStorageService {
    addItem(key: string, value: any, expiry: Date): void;
    appendItem(key: string, appendFactory: (value: any) => any): void;
    createExpiryKey(key: string): string;
    getItemRaw(key: string): CachedItem;
    getItem(key: string): any;
    removeItem(key: string): void;
    removeAll(prefix: string): void;

}

export interface CachedItem {
    value: any;
    type: string;
    expiry: number;
}

export interface IBSDataTableHttpClient {
    get(options: BSDataTableHttpClientOptions): void;
    notifyResponse(response: any): void;
    nofifyError(error: any, options: BSDataTableHttpClientOptions): void;
}

export interface InfiniteScrollOptions{
    gridElement: Element;
    httpClient: IBSDataTableHttpClient;
}


