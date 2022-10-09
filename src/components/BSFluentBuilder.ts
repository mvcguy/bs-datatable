import { BSDataTableColDefinition, BSDataTableOptions, BSDataTablePagingMetaData, getNextPageOffline, getUrlCallback } from "../commonTypes/common-types";
import { BSDataTable } from "./BSDataTable";


export class BSFluentBuilder {
    options: BSDataTableOptions

    constructor(options: BSDataTableOptions) {
        this.options = options ?? {
            enableInfiniteScroll: true,
            cacheResponses: false,
            gridId: 'bsDataTable',
            containerId: 'bsContainer',
            isReadonly: false,
            colDefinition: [],
        };

        if (!this.options.dataSource) {
            this.options.dataSource = {
                name: 'bsDataSource',
                data: {
                    initData: [],
                    metaData: new BSDataTablePagingMetaData()
                },
                isRemote: true,
                getPageOfflineCB: (page, data, mdata) => {
                    var start = Math.max(0, (page - 1) * mdata.pageSize);
                    var end = Math.min(start + mdata.pageSize, data.length);
                    var pageData = [];
                    for (let index = start; index < end; index++) {
                        const dt = data[index];
                        pageData.push(dt);
                    }
                    return pageData;
                }
            };
        }

    }

    static CreateBuilder(options?: BSDataTableOptions) {
        return new BSFluentBuilder(options);
    }

    Build() {
        var dataTable = new BSDataTable(this.options);
        return dataTable;
    }

    SetId(tableId: string) {
        this.options.gridId = tableId;
        return this;
    }

    SetContainerId(containerId: string) {
        this.options.containerId = containerId;
        return this;
    }

    SetDataSourceName(ds: string) {
        this.options.dataSource.name = ds;
        return this;
    }

    /**
     * Default is set to true
     * @param remote 
     * @returns 
     */
    IsRemote(remote: boolean = true) {
        this.options.dataSource.isRemote = remote;
        return this;
    }

    /**
     * Default is set to false
     * @param readonly 
     * @returns 
     */
    IsReadonly(readonly: boolean = false) {
        this.options.isReadonly = readonly;
        return this;
    }

    /**
     * Default is set to false
     * @param cache 
     * @returns 
     */
    CacheResponses(cache: boolean = false) {
        this.options.cacheResponses = cache;
        return this;
    }

    /**
     * Default is set to true
     * @param enable 
     * @returns 
     */
    EnableInfiniteScroll(enable: boolean = true) {
        this.options.enableInfiniteScroll = enable;
        return this;
    }

    NextPageUrlCallback(callback: getUrlCallback) {
        this.options.dataSource.url = callback;
        return this;
    }

    GetNextPageOfflineCallback(callback: getNextPageOffline) {
        this.options.dataSource.getPageOfflineCB = callback;
        return this;
    }

    AddColumn(colConfig: (options: BSDataTableColDefinition) => void | BSDataTableColDefinition) {

        if (typeof colConfig == "function") {
            var col: BSDataTableColDefinition = {
                DataSourceName: this.options.dataSource.name,
                Width: "90px",
                ContainerId: this.options.containerId,
                IsKey: false,
                DataType: 'text',
                ValidationRules:[]
            };
            colConfig(col);
            this.options.colDefinition.push(col);
        }
        else {
            this.options.colDefinition.push(colConfig);
        }
        return this;
    }

    AddInitData(config: (data: { initData: any[]; metaData: BSDataTablePagingMetaData }) => void) {
        config(this.options.dataSource.data);
        return this;
    }

}