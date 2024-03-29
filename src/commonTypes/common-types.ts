import { Tooltip } from "bootstrap";

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
    ValidationRules?: BSValidationRule[]

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

export interface BSDataTableSelectListItem {
    text: string;
    value: string;
    isSelected?: boolean;

}

export interface BSDataTableColDefinition {
    /**
     * Display name
     */
    DisplayName?: string;
    DataType?: string;
    Width?: string;

    /**
     * variable name - must not contain spaces
     */
    PropName?: string;
    IsKey?: boolean;
    /**
     * The options of a select list/dropdown
     */
    SelectList?: BSDataTableSelectListItem[];
    ColSpan?: number;
    RowSpan?: number;

    /**
     * The URL to get the data for a selector 
     * Selector displays data in a grid where needs to be bind to some tabuler data
     */
    SelectorDataCB?: getUrlCallback;

    /**
     * The column list of the grid displayed in the selector window
     */
    SelectorCols?: BSDataTableColDefinition[];

    DataSourceName?: string;

    ContainerId?: string;

    IsReadOnly?: boolean;

    ValidationRules?: BSValidationRule[]
}


/**
 * A callback type to get the next page in the offline mode
 * @callback getNextPageOffline
 * @param {number} pageIndex
 * @param {any[]} data - dataset
 * @param {BSDataTablePagingMetaData} metadata - dataseta metadata
 * @returns {any[]} returns the data model for the request page
 */

export interface getNextPageOffline { (pageIndex: number, data: any[], metaData: BSDataTablePagingMetaData): any[] };

export interface BSInitDataModel {
    data: any[],
    metaData: BSDataTablePagingMetaData
}


export interface BSDataTableDataSource {
    name?: string;
    isRemote?: boolean;
    data?: { initData: any[]; metaData: BSDataTablePagingMetaData; };
    url?: getUrlCallback;
    getPageOfflineCB?: getNextPageOffline;
}

export interface BSDataTableOptions {
    gridId?: string;
    containerId?: string;
    colDefinition?: BSDataTableColDefinition[];
    dataSource?: BSDataTableDataSource;
    enableInfiniteScroll?: boolean;
    cacheResponses?: boolean;
    isReadonly?: boolean;
}

export class BSDataTablePagingMetaData {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;

    constructor(pageIndex: number = 1, pageSize: number = 10, totalRecords: number = 10) {
        this.pageIndex = pageIndex;
        this.pageSize = !pageSize || pageSize <= 0 ? 10 : pageSize;
        this.totalRecords = totalRecords;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    }
}


export interface BSDataTablePaginationOptions {
    dataSourceName: string;
    metaData?: BSDataTablePagingMetaData;
    nextPageCallback: (page: number) => void;
}


export interface BSDataTableHttpClientOptions {
    url: string;
    method?: string;
    headers?: any[];
    recordId?: string;
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
    notifyResponse(response: any, options: BSDataTableHttpClientOptions): void;
    notifyError(error: any, options: BSDataTableHttpClientOptions): void;
}

export interface InfiniteScrollOptions {
    gridElement: Element;
    httpClient: IBSDataTableHttpClient;
}

export interface BSDataTableHyperLinkOptions {
    text?: string;
    href?: string;
    classes?: string;
    dataSourceName: string;
    clickHandler?: (e: MouseEvent) => void;
}


export interface BSValidationOptions {

    /**
     * An arrary of control options which the validator is going to validate
     */
    Controls?: BSInputControlOptions[]

    /**
     * If we want to update the class of the input control for visual effects
     *  we need to specify its name here.
     * By default its value is set to 'form-control-danger' class
     */
    ControlErrorClass?: string

    /**
     * By Default the validator inserts a new element below the input control to show 
     * validation errors. Set this property to a css class to format such messages
     */
    ErrorMessageClass?: string

    /**
     * Invoked when the validation is completed. Its called on the grid/form level
     */
    OnValidated?: (sender: any, args: any) => void

    /**
     * Data source name of the grid
     */
    DataSourceName?: string

    /**
     * A unique name for the current validator, since there can many validators on the same page
     * Its a good idea to name each validator uniquely 
     */
    ValidatorName?: string

    /**
     * Be default validation messages are shown under the input control, but when this property is set, these are displayed as tooltips
     */
    ShowMessagesAsToolTips?: Boolean

    /**
     * By default the class is set to 'tooltip-error'
     */
    TooltipClass?: string
}

export interface BSInputControlOptions {
    /**
     * The ID of the control which is being validated. This prop is optional if the Control prop is set
     */
    Id?: string

    /**
     * The control which is being validated. This prop is optional if the ID of the control is already provided
     */
    Control?: HTMLInputElement
    Rules?: BSValidationRule[]
}

export interface BSValidationRule {
    RuleType?: keyof BSValidationRuleType
    DisplayName?: string
    ErrorMessage?: string
    ControlErrorClass?: string // To override the general error class
    ErrorMessageClass?: string // To override the general error class
    Start?: number
    End?: number
    Length?: number
    MinLength?: number
    MaxLength?: number
}

export interface ControlValidationModel {
    Control: HTMLInputElement
    Options: BSInputControlOptions
    MessageNode?: HTMLElement;
    MessageTooltip?: Tooltip;
    IsValid: boolean;
    Messages: string[];
    ExistingTooltip?: string;
    
}

export interface BSValidationRuleType {
    "LENGTH": string
    "REQUIRED": string
    "RANGE": string
    "GENERAL": string
}



