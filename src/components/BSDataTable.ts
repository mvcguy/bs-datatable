
import { Tooltip } from "bootstrap"
import { BSDataTableBase } from "./BSDataTableBase";
import '../services/string.extensions'
import {
    SessionStorageService, bsDataTableDiscoveryService, CookieHelper
    , dataEventsService, appDataEvents, appActions
} from "../services";

import { BSDataTableCell } from "./BSDataTableCell";
import {
    BSDataTableColDefinition, BSEventHandler
    , BSEventSubscriberModel, BSSortingRequestEvent, BSConfigUpdatedEvent
    , BSColsReorderedEvent
    , BSFetchRecordEvent, BSGridUpdatedEvent, BSRowUpdatedEvent
    , BSFieldUpdatedEvent, BSDataTablePagingMetaData, BSDataTablePaginationOptions
    , BSDataTableOptions, BSDataTableHttpClientOptions, BSEvent,
    BSFetchRecordErrorEvent, BSColumnSettings, IBSDataTableHttpClient
} from "../commonTypes/common-types";

import { BSDataTableCheckBox } from "./BSDataTableCheckBox";
import { BSDataTableHttpClient } from "./BSDataTableHttpClient";
import { BSDataTablePagination } from "./BSDataTablePagination";
import { BSDataTableInfiniteScroll } from "./BSDataTableInfiniteScroll";
import { BSDataTableMarker } from "./BSDataTableMarker";
import { BSDataTableActions } from "./BSDataTableActions";
import { BSDataTableRow } from "./BSDataTableRow";
import { BSDataTableHeader } from "./BSDataTableHeader";
import { BSDataTableBody } from "./BSDataTableBody";

export class BSDataTable extends BSDataTableBase {

    options: BSDataTableOptions;
    head: BSDataTableHeader;
    body: BSDataTableBody;
    paginator: BSDataTablePagination;
    httpClient: IBSDataTableHttpClient;
    infiniteScroller: BSDataTableInfiniteScroll;
    gridActions: BSDataTableActions;
    discoverable: boolean;
    containerElement: HTMLElement;

    constructor(options: BSDataTableOptions) {
        super();

        this.options = options;
        this.head = new BSDataTableHeader();
        this.body = new BSDataTableBody();
        this.paginator = new BSDataTablePagination(
            new BSDataTablePaginationOptions(this.options.dataSource.name,
                new BSDataTablePagingMetaData(),
                (page) => this.paginatorCallback(page)));

        this.httpClient = options.httpClient ?? new BSDataTableHttpClient(new SessionStorageService()
            , this.options.dataSource.name
            , this.options.cacheResponses);

        this.infiniteScroller = null;
        this.gridActions = null;
        this.discoverable = true;
        this.containerElement = document.getElementById(this.options.containerId);
    }

    notifyListeners(eventType: string, payload: BSEvent) {
        dataEventsService.Emit(eventType, this, payload);
    }

    setDiscoverable() {
        bsDataTableDiscoveryService.Add(this);
    }

    get dataSourceName(): string {
        return this.options.dataSource.name;
    }

    get isReadOnly(): boolean {
        return this.options.isReadonly;
    }

    get dirtyRecords(): any[] {
        return this.body.getDirtyRecords();
    }

    get allRecords(): any[] {
        return this.body.getAllRecords();
    }

    /**
     * @param {number} page
     */
    paginatorCallback(page: number) {
        // console.log(`Page.Nbr: ${page} is requested`);
        this.fetchGridPage(page);
    }

    appendHeader() {
        this.element.append(this.head.element);
    }

    appendBody() {
        this.element.append(this.body.element);
    }

    getGridSettings(gridId): { [x: string]: BSColumnSettings; } {
        try {
            // debugger;
            var gridSettings = CookieHelper.getJSON(gridId);
            //console.log('GridSettings Cookie: ', gridSettings ? 'settings found' : 'no settings found!');

            return gridSettings;

        } catch (error) {
            console.log(error);
            return undefined;
        }
    };

    render() {

        this.element = document.createElement('table');
        this.element.classList.add('table', 'table-bordered', 'table-hover', 'table-sm', 'resizable', 'navTable', 'nowrap', 'bs-table');


        this.id = this.options.gridId;
        this.prop('data-datasource', this.options.dataSource.name);

        var settings = this.getGridSettings(this.options.gridId) || {};
        this.css = { 'width': 'inherit' };

        var gridHeaderRow = new BSDataTableRow({
            dataSourceName: this.options.dataSource.name,
            gridId: this.options.gridId,
            gridHeader: true
        });
        gridHeaderRow.addClass('draggable').addClass('grid-cols');

        var templateRow = new BSDataTableRow({
            isTemplateRow: true,
            dataSourceName: this.options.dataSource.name,
            gridId: this.options.gridId,
            containerId: this.options.containerId
        });
        templateRow.addClass('grid-rows');

        templateRow.css = { 'display': 'none' };
        templateRow.visible = false;


        var gridColumns = this.applyColOrdering(settings);

        //
        // add row markers - this helps to improve the visual appearance of selected row
        //
        var mh = new BSDataTableCell(new BSDataTableColDefinition(), true);

        var marker = new BSDataTableMarker();
        var mb = new BSDataTableCell(new BSDataTableColDefinition());
        mb.append(marker);

        gridHeaderRow.addCell(mh);
        templateRow.addCell(mb);


        gridColumns.forEach((gc) => {

            //
            // the grid stores a cookie which contains info about the visiblity and size of the column
            // we will use this info to size and visualize the grid data
            //

            if (!gc.PropName) return;

            var colSettings = settings[gc.PropName];

            var th = gridHeaderRow.createHeaderFor(gc);
            var td = templateRow.createInputFor(gc, this.isReadOnly);

            //
            // sorting of the data when the header cell is clicked
            //
            this.addSorting(th);
            this.applyColSettings(th, colSettings);
            this.applyColSettings(td, colSettings);
            gridHeaderRow.addCell(th);
            templateRow.addCell(td);
        });

        this.head.addRow(gridHeaderRow);
        this.body.addRow(templateRow)

        //
        // add grid actions toolbar
        //
        this.appendActions();

        //
        // add header and body to the grid
        //
        this.appendHeader();
        this.appendBody();

        //
        // add grid to the provided container
        //
        this.containerElement.appendChild(this.element);

        //
        // enable infinite scroll
        //
        this.addInfiniteScroll();

        //
        // add data to the grid
        //
        var data = this.options.dataSource.data.initData;
        var mdata = this.options.dataSource.data.metaData;


        let fetchDataEvent: BSFetchRecordEvent = {
            DataSourceName: this.options.dataSource.name, EventData: {
                Data: data,
                MetaData: mdata
            }
        };
        this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD, fetchDataEvent);

        //
        // notify that grid is data-bound
        //
        this.notifyListeners(appDataEvents.ON_GRID_DATA_BOUND,
            {
                DataSourceName: this.options.dataSource.name,
                EventData: {}
            });

        if (this.discoverable === true) {
            this.setDiscoverable();
        }
    };

    addInfiniteScroll() {
        if (this.options.enableInfiniteScroll === true) {
            this.infiniteScroller = new BSDataTableInfiniteScroll({ gridElement: this.element, httpClient: this.httpClient });
            this.infiniteScroller.nextPageCallback = (page) => this.paginatorCallback(page);
            this.infiniteScroller.enable();
        }
    }

    appendActions() {
        this.gridActions = new BSDataTableActions();
        this.gridActions.dataSourceName = this.options.dataSource.name;
        this.gridActions.addNewRecordAction((e) => this.addEmptyRow())
            .addDeleteAction((e) => this.body.markDeleted())
            .addGridSettingsAction();
                
        //
        // add actions for the grid to the container
        //
        this.containerElement.appendChild(this.gridActions.element);

    }

    /**
     * @param {BSDataTableCell} th
     */
    addSorting(th: BSDataTableCell) {
        //
        // sorting of the data when the header cell is clicked
        //
        var _this = this;
        th.addEventHandler('click', function (e) {

            var asc = true;
            if (th.hasClass('sorting_asc')) {
                th.removeClass('sorting_asc').addClass('sorting_desc');
                asc = false;
            }
            else {
                th.removeClass('sorting_desc').addClass('sorting_asc');
            }

            //
            // supports sorting on only one column.
            //
            th.siblings('th').forEach((x) => {
                x.classList.remove('sorting_asc', 'sorting_desc');
            });

            //
            // notify that we need sorting of the column
            //
            var prop = th.options.PropName;

            //
            // TODO: fix
            //
            let event: BSSortingRequestEvent = { EventData: { Event: e, PropName: prop, Asc: asc }, DataSourceName: _this.options.dataSource.name };

            _this.notifyListeners(appDataEvents.ON_SORTING_REQUESTED, event);

        });
    }

    clearGrid() {

        var rows = this.findElements('.grid-row');
        rows.forEach((row) => this.removeElement(row));

        // remove all except the template row
        var templateRow = this.body.getTemplateRow();
        this.body.rows = [templateRow];
    };

    /**
     * Apply visibility and size settings from store cookie.
     * This helps the user not to re-arrange cols based on their needs all the time they open the screen
     * @param {BSDataTableCell} col
     * @param {any} settings
     */
    applyColSettings(col: BSDataTableCell, settings: BSColumnSettings) {

        if (!settings || this.isEmptyObj(settings)) return;

        if (settings.Visible === false) {
            col.visible = false;
        }

        if (settings.Width) {
            col.css = { 'position': 'relative', 'width': settings.Width };
        }
    };

    /**
     * Apply column re-ordering based on the stored cookie
     * This helps the user to not re-order the columns everytime they open the screen.
     * @param {*} settings 
     * @returns {BSDataTableColDefinition[]}
     */
    applyColOrdering(settings: { [x: string]: BSColumnSettings; }): BSDataTableColDefinition[] {

        if (!settings || this.isEmptyObj(settings)) return this.options.colDefinition;
        var orderedCols = [];

        this.options.colDefinition.forEach((colDef, i) => {
            let colSetting: BSColumnSettings = settings[colDef.PropName];
            if (!colSetting) return;
            orderedCols[colSetting.Position] = colDef;
        });

        // in case the col settings stored in cookie are not matching, we return the current col definition
        if (orderedCols.length !== this.options.colDefinition.length) return this.options.colDefinition;

        return orderedCols;
    }

    /**
     * @param {object[]} data
     * @param {BSDataTablePagingMetaData} [metaData]
     * @returns
     */
    bindDataSource(data: object[], metaData: BSDataTablePagingMetaData) {

        // debugger;
        if (!data || data.length <= 0) return;

        var pagedData = data;
        if (this.options.dataSource.isRemote === false) {
            pagedData = this.options.dataSource.getPageOfflineCB(metaData.pageIndex, this.options.dataSource.data.initData, metaData);
        }

        /**
         * @type {BSDataTableRow}
         */
        var lastRow: BSDataTableRow = null;
        pagedData.forEach((v, i) => {
            var row = this.addNewRow(v, true);
            row.rowCategory = 'PRESTINE';
            lastRow = row;
        });

        //
        // update the pagination component
        //
        if (this.options.enableInfiniteScroll == false)
            this.bindPaginator(metaData);
        else {
            this.infiniteScroller.initMetaData = metaData;
            this.infiniteScroller.initData = pagedData;
            if (lastRow) {

                this.infiniteScroller.unobserve();
                this.infiniteScroller.observe(lastRow.element);
            }
        }
    }


    /**
     * @param {BSDataTablePagingMetaData} [paginationModel]
     */
    bindPaginator(paginationModel: BSDataTablePagingMetaData = new BSDataTablePagingMetaData()) {
        this.paginator.options.pagingMetaData = paginationModel;
        this.paginator.render();
        var container = document.getElementById('#' + this.options.containerId);
        container.appendChild(this.paginator.element);
    }

    /**
     * @param {object} rowData
     * @param {boolean} isExistingRecord
     */
    addNewRow(rowData: object, isExistingRecord: boolean) {
        var rowNumber = this.body.getNextRowIndex();
        var row = this.body.getTemplateRow().clone();
        row.options.isTemplateRow = false;

        row.addClass('grid-row');
        row.css = { 'display': 'table-row' };
        row.visible = true;

        var _this = this;

        var inputs = row.getInputs();

        // debugger;

        inputs.forEach(function (v, i) {
            var input = v;

            var oldId = input.id;
            input.id = oldId + "_" + rowNumber;

            var cellPropName = input.options.ModelName;
            // console.log('cell-pro', cellPropName);

            var cellVal = rowData[cellPropName];

            if (input.options.InputType === 'date' && cellVal) {
                var date = new Date(cellVal);

                input.val = _this.toDateDisplayFormat(date);
            }
            else if (input instanceof BSDataTableCheckBox
                && (cellVal === 'true' || cellVal === 'True' || cellVal === true)) {
                input.prop('checked', 'checked');
            }
            else if (cellVal !== undefined) {
                input.val = cellVal;
            }

            // debugger;
            if (isExistingRecord === false) {
                input.disabled = false;
                input.readonly = false;
            }

            input.element.addEventListener('change', (e) => {

                row.prop('data-isdirty', true);

                var rowCat = row.rowCategory;
                if (rowCat !== 'ADDED') {
                    row.rowCategory = 'UPDATED';
                }

                // remove any previous errors
                input.removeClass('is-invalid').prop('title', '');

                var tooltip = Tooltip.getInstance(e.target as Element);
                if (tooltip)
                    tooltip.dispose();

                var rowData = row.getRowDataExt();
                var ds = _this.options.dataSource.name;

                let gridUpdateEvent: BSGridUpdatedEvent = { EventData: { Event: e, Grid: _this }, DataSourceName: ds };
                let rowUpdatedEvent: BSRowUpdatedEvent = { EventData: { Event: e, Row: rowData }, DataSourceName: ds };
                let fieldUpdaedEvent: BSFieldUpdatedEvent = { EventData: { Event: e, Row: rowData, Field: input }, DataSourceName: ds };


                _this.notifyListeners(appDataEvents.ON_GRID_UPDATED, gridUpdateEvent);
                _this.notifyListeners(appDataEvents.ON_FIELD_UPDATED, fieldUpdaedEvent);
                _this.notifyListeners(appDataEvents.ON_ROW_UPDATED, rowUpdatedEvent);

            });

            input.element.addEventListener('focus', function (e) {
                _this.body.focusRow(row);
            });
        });

        row.element.addEventListener('click', function (e) {
            _this.body.focusRow(row);
        });

        this.body.addRow(row);

        var visibleInputs = row.getVisibleInputs();

        if (visibleInputs.length > 0) {
            var lastInput = visibleInputs[visibleInputs.length - 1];

            lastInput.element.addEventListener('keydown', (e) => this.onInputKeyDown);
        }

        return row;

    };

    toDateDisplayFormat(date: Date) {

        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        let monthStr = (month < 10 ? "0" : "") + month;
        let dayStr = (day < 10 ? "0" : "") + day;

        return year + "-" + monthStr + "-" + dayStr;
    }

    toTimeDisplayFormat(date: Date) {
        var hour = date.getHours(),
            min = date.getMinutes();

        let hourStr = (hour < 10 ? "0" : "") + hour;
        let minStr = (min < 10 ? "0" : "") + min;

        return hourStr + ":" + minStr;
    }

    /**
     * 
     * @param {BSDataTableRow} row 
     * @param {*} e 
     * @returns 
     */
    onInputKeyDown(e: KeyboardEvent) {

        //
        // insert a new row if its the last input in the row
        //   

        if (e.which !== 9 || e.shiftKey === true) return;
        // debugger;
        var visibleRows = this.body.getVisibleRows();
        if (visibleRows.length <= 0) return;
        var lastRowIndex = visibleRows[visibleRows.length - 1].rowIndex;

        var row = (e.target as Element).closest('tr');
        if (!row) return;

        var parentIndex = parseInt(row.getAttribute('data-rowindex'));

        // console.log(gridRows, currentRowIndex);
        if (lastRowIndex === parentIndex) {
            var eRow = this.addEmptyRow();
        }
    };

    addEmptyRow() {
        var emptyRow = this.addNewRow(this.createEmptyRowData(), false);

        var inputs = emptyRow.getVisibleInputs();
        if (inputs.length > 0) {
            inputs[0].focus();
        }

        emptyRow.rowCategory = 'ADDED'
        emptyRow.prop('data-isdirty', 'true');

        let gridUpdateEvent: BSGridUpdatedEvent = { EventData: { Grid: this, Event: emptyRow }, DataSourceName: this.options.dataSource.name };
        this.notifyListeners(appDataEvents.ON_GRID_UPDATED, gridUpdateEvent);

        this.infiniteScroller.unobserve();
        this.infiniteScroller.observe(emptyRow.element);

        return emptyRow;
    };

    createEmptyRowData() {
        var record = {};
        this.options.colDefinition.forEach((v, i) => { record[v.PropName] = undefined })
        //debugger;
        return record;
    };

    onHeaderNext(eventArgs: BSEvent, fetchGrid: boolean) {

        if (!eventArgs || !eventArgs.EventData) return;

        // console.log(eventArgs);
        this.resetSorting();
        this.clearGrid();
        this.paginator.clear();

        if (fetchGrid === false) return;
        //
        // fetch grid data
        //        
        this.fetchGridPage(1);

        if (this.options.enableInfiniteScroll === true) {
            this.infiniteScroller.currentPage = 1;
        }
    };

    /**
     * @param {number} pageIndex
     */
    fetchGridPage(pageIndex: number) {

        if (this.options.dataSource.isRemote === true) {
            var url = this.options.dataSource.url(pageIndex);
            if (!url) return;

            var options = new BSDataTableHttpClientOptions(url, "GET");

            this.httpClient.get(options);
        }
        else {
            var data = this.options.dataSource.data.initData;
            var mdata = this.options.dataSource.data.metaData;
            //var cb = this.options.dataSource.getPageOfflineCB;
            //var pageData = cb(pageIndex, data, mdata);
            var fetchRecordEvent: BSFetchRecordEvent = {
                DataSourceName: this.options.dataSource.name,
                EventData: {
                    Data: data,
                    MetaData: new BSDataTablePagingMetaData(pageIndex, mdata.pageSize, mdata.totalRecords)
                }
            };
            this.notifyListeners(appDataEvents.ON_FETCH_GRID_RECORD, fetchRecordEvent);

        }

    }

    onSaveRecord(eventArgs: BSEvent) {

        //
        // remove rows from the grid that has been deleted
        //

        // this.body.find("tr[data-rowcategory='DELETED']").remove();
        // this.body.find("tr[data-rowcategory='ADDED_DELETED']").remove();

        //
        // remove elements from the real and virtual DOM
        //
        this.body.rows
            .filter((v) => v.rowCategory === 'DELETED' || v.rowCategory === 'ADDED_DELETED')
            .forEach((v) => this.body.removeRow(v));

        //
        // when main record is saved, disable the key columns of the grid,
        //        
        this.body.rows.forEach((v) => {

            // mark all rows prestine
            v.rowCategory = 'PRESTINE';

            // make id inputs disabled
            v.getInputs().filter((x) => x.isKey).forEach((vx) => { vx.disabled = true; });
        });
    };

    onSaveError(eventArgs: BSEvent) {

        /*
        // Its assumed that the .net mvc api will convert the model state errors into the following format
        //
        // {
        //     "addresses.[0]": ["1"], // client row index
        //     "addresses.[1]": ["2"],
        //     "addresses.[2]": ["3"],
        //     "addresses[1].City": ["The City: field is required.", "The City: must be at least 3 and at max 128 characters long."],
        //     "addresses[1].Country": ["The Country: field is required.", "The Country: must be at least 2 and at max 128 characters long."],
        //     "addresses[1].PostalCode": ["The Postal code: field is required.", "The Postal code: must be at least 3 and at max 128 characters long."],
        //     "addresses[1].StreetAddress": ["The Street address: field is required.", "The Street address: must be at least 3 and at max 128 characters long."],
        //     "addresses[2].City": ["The City: field is required.", "The City: must be at least 3 and at max 128 characters long."],
        //     "addresses[2].Country": ["The Country: field is required.", "The Country: must be at least 2 and at max 128 characters long."],
        //     "addresses[2].PostalCode": ["The Postal code: field is required.", "The Postal code: must be at least 3 and at max 128 characters long."],
        //     "addresses[2].StreetAddress": ["The Street address: must be at least 3 and at max 128 characters long."]
        / }
        */

        if (!eventArgs || !eventArgs.EventData || !eventArgs.EventData.Event.responseJSON) return;
        var errors = eventArgs.EventData.Event.responseJSON;
        var dsName = this.options.dataSource.name;

        var dirtyRows = this.body.getDirtyRows();

        for (let i = 0; i < dirtyRows.length; i++) {
            //debugger;
            var errorProp = dsName + '[' + i + ']';
            var im = errors[errorProp];
            if (im && im.length > 0) {
                var clientIndex = im[0];
                var serverIndex = i;

                var errorRow = this.getRowByIndex(parseInt(clientIndex));
                if (!errorRow) continue;

                this.options.colDefinition.forEach((col, i) => {

                    var propName = col.PropName.toPascalCaseJson();
                    var inputError = errors[dsName + '[' + serverIndex + '].' + propName];
                    if (inputError && inputError.length > 0) {

                        var input = errorRow.getInputs().find((inp) => inp.options.ModelName === col.PropName);

                        if (input) {
                            input.addClass('is-invalid');
                            //console.log(inputError);
                            var allErrors = '';
                            Array.from(inputError).forEach(function (er) {
                                allErrors += er + ' ';
                            });
                            input.prop('title', allErrors);
                            var tooltip = new Tooltip(input[0], { customClass: 'tooltip-error' });
                        }
                    }

                });
            }
        }

    }

    getRowByIndex(index: number) {
        return this.body.rows.find((v, i) => v.rowIndex === index);
    }

    /**
     * @param {BSDataTableCell} th
     * @param {boolean} ascX
     */
    sortTable(th: BSDataTableCell, ascX: boolean) {

        //  console.log('sorting', ascX);
        const getCellValue = (tr: BSDataTableRow, idx: number) => {
            var child = tr.cells[idx];
            // console.log('idx: ', idx,  child);
            return child.getCellText();
        };


        // Returns a function responsible for sorting a specific column index 
        // (idx = columnIndex, asc = ascending order?).
        var comparer = function (idx: number, asc: boolean) {
            //console.log('idx: ', idx, 'asc: ', asc);
            // This is used by the array.sort() function...
            return function (a: BSDataTableRow, b: BSDataTableRow) {
                //console.log('a: ', a, 'b: ', b);

                // This is a transient function, that is called straight away. 
                // It allows passing in different order of args, based on 
                // the ascending/descending order.
                return function (v1, v2) {
                    //  console.log('v1: ', v1, 'v2: ', v2);
                    // sort based on a numeric or localeCompare, based on type...
                    // return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
                    //     ? v1 - v2
                    //     : v1.toString().localeCompare(v2);
                    return v1.toString().localeCompare(v2.toString())
                }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
            }
        };

        // do the work...
        // const table = th.closest('table');

        //debugger;
        var ds = this.options.dataSource.name;
        // console.log(rows);
        var list = this.body.rows.sort(comparer(this.head.getGridTitlesRow().cells.indexOf(th), ascX = !ascX));

        list.forEach(tr => this.body.append(tr, false));


        let confEvent: BSConfigUpdatedEvent = { EventData: { CurrentCol: th, Action: appActions.COL_SORTING }, DataSourceName: ds };
        let colReorderEvent: BSColsReorderedEvent = { EventData: { CurrentCol: th, Asc: ascX }, DataSourceName: ds };
        this.notifyListeners(appDataEvents.ON_COLS_REORDERED, colReorderEvent);

        this.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED, confEvent);

    };

    onSortingRequest(eventArgs: BSSortingRequestEvent) {
        // console.log(eventArgs);

        var target = eventArgs.EventData.Event.target as Element;

        var isTh = target.tagName.toLowerCase() === 'th';

        if (!isTh) {
            var th = target.closest('th');
            if (!th) return;

            target = th;
        }
        var thx = this.head.getGridTitlesRow().cells.find((v, i) => v.element === target);
        if (!thx) return;

        // debugger;
        this.sortTable(thx, eventArgs.EventData.Asc);
    };

    resetSorting() {

        this.head.rows.forEach((v, i) => {
            if (v.hasClass('sorting_desc' || v.hasClass('sorting_asc'))) {
                v.removeClass('sorting_asc').removeClass('sorting_desc');
            }
        });
    };

    onColsReordered(eventArgs: BSColsReorderedEvent) {

        //
        // modify 'keydown' events on the row inputs
        //
        var grid = this;
        // console.log(eventArgs);


        grid.body.rows.forEach((row, i) => {

            var inputs = row.getInputs();
            inputs.forEach((inp) => { inp.element.removeEventListener('keydown', this.onInputKeyDown) });
            var visibleInputs = row.getVisibleInputs();
            if (visibleInputs.length <= 0) return;
            var lastInput = visibleInputs[visibleInputs.length - 1];
            lastInput.element.addEventListener('keydown', this.onInputKeyDown);
        });

    }

    /**
     * Add handler to the events raised by the data table
     * @param eventName 
     * @param callback 
     * @param verifyDSName 
     */
    addHandler(eventName: string, callback: BSEventHandler, verifyDSName = false) {
        let model: BSEventSubscriberModel = {
            Key: this.options.gridId,
            EventName: eventName,
            Callback: callback,
            DataSourceName: this.options.dataSource.name,
            VerifyDataSourceName: verifyDSName
        };
        dataEventsService.Subscribe(model);
    };

    removeHandler(eventName: string) {
        let model: BSEventSubscriberModel = {
            Key: this.options.gridId,
            EventName: eventName,
            DataSourceName: this.options.dataSource.name,
        };
        dataEventsService.Unsubscribe(model);
    };

    onFetchData(eventArgs: BSFetchRecordEvent) {

        // console.log('onFetchData:', eventArgs);

        //
        // populate the grid with the fetched data
        //
        if (this.options.enableInfiniteScroll === false)
            this.clearGrid();
        var md = eventArgs.EventData.MetaData;
        if (!md) return;
        this.bindDataSource(eventArgs.EventData.Data, new BSDataTablePagingMetaData(md.pageIndex, md.pageSize, md.totalRecords));
    }

    onFetchDataError(eventArgs: BSFetchRecordErrorEvent) {
        // console.error('onFetchDataError: ', eventArgs);
    }

    registerCallbacks(verifyDSName = true) {
        // debugger;
        var id = this.options.gridId;
        var ds = this.options.dataSource.name;

        //
        // subscribe to main view/form events
        //
        this.addHandler(appDataEvents.GRID_DATA, (sender, ev) => this.body.getDirtyRecords()); // TODO: obsolete -> replaced with discovery service
        this.addHandler(appDataEvents.ON_ADD_RECORD, (sender, ev) => this.onHeaderNext(ev, false));
        this.addHandler(appDataEvents.ON_FETCH_RECORD, (sender, ev) => this.onHeaderNext(ev, true));
        this.addHandler(appDataEvents.ON_SAVE_RECORD, (sender, ev) => this.onSaveRecord(ev));
        this.addHandler(appDataEvents.ON_SAVE_ERROR, (sender, ev) => this.onSaveError(ev));

        //
        // subscribe to grid events
        //
        this.addHandler(appDataEvents.ON_SORTING_REQUESTED, (sender, ev) => this.onSortingRequest(ev), verifyDSName);
        this.addHandler(appDataEvents.ON_COLS_REORDERED, (sender, ev) => this.onColsReordered(ev), verifyDSName);
        this.addHandler(appDataEvents.ON_GRID_CONFIG_UPDATED, (sender, ev) => this.onGridConfigurationChanged(ev), verifyDSName);
        this.addHandler(appDataEvents.ON_GRID_DATA_BOUND, (sender, ev) => this.onGridDataBound(ev), verifyDSName);
        this.addHandler(appDataEvents.ON_FETCH_GRID_RECORD, (sender, ev) => this.onFetchData(ev), verifyDSName);
        this.addHandler(appDataEvents.ON_FETCH_GRID_RECORD_ERROR, (sender, ev) => this.onFetchDataError(ev), verifyDSName);
    }

    configurableGrid() {
        // console.log('configurableGrid is reached', this);
        var headers = this.head.getGridTitlesRow().cells;
        var ds = this.options.dataSource.name;

        //
        // A modal for configuring grid columns.
        // The modal ahs an <ul> element which will be populated below with grid columns check-list.
        // the checks can be used to show/hide a particular grid column
        //
        var modelTemplate =
            `
            <div class="modal fade" id="staticBackdrop_${ds}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel_${ds}">Configure columns</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="list-group grid-config-cols">

                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Ok</button>
                        </div>
                    </div>
                </div>
            </div>`;

        var modalElem = document.createElement('div');
        modalElem.classList.add('settings-menu', 'grid-config-template');
        modalElem.innerHTML = modelTemplate;

        this.containerElement.append(modalElem);

        var colsList = modalElem.querySelector('.grid-config-cols');
        headers.forEach((header, index) => {

            var propName = header.options.PropName;
            if (!propName) return;

            var colsListItem = document.createElement('li');
            colsListItem.classList.add('list-group-item');

            var chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.value = '';
            chk.classList.add('form-check-input', 'me-1');

            var chkId = 'col_config_chk_' + propName;
            chk.setAttribute('id', chkId);
            chk.setAttribute('data-config-propname', propName);
            if (header.visible === true) {
                chk.checked = true;
            }

            var chkLbl = document.createElement('label');
            chkLbl.setAttribute('for', chkId);

            // debugger;
            chkLbl.textContent = header.getText();

            colsListItem.appendChild(chk);
            colsListItem.appendChild(chkLbl);
            colsList.appendChild(colsListItem);

            chk.addEventListener('click', (e) => {
                var chkElement = e.target as HTMLInputElement;

                var prop = chkElement.getAttribute('data-config-propname');
                if (!prop) return;

                var headerRow = this.head.getGridTitlesRow();
                var col = headerRow.cells.find((cell) => cell.options.PropName === prop);
                if (!col) return;

                var bodyRows = this.body.rows;

                var rows = [...bodyRows, headerRow];

                //var rows = this.find('.grid-cols, .grid-rows');


                //var index = Array.from(col.parent('tr').children()).indexOf(col[0]);
                var index = headerRow.cells.indexOf(col);
                if (index < 0) return;

                rows.forEach((row) => {

                    var cell = row.cells[index];

                    if (!cell) return;

                    if (chkElement.checked) {
                        // $(cell).show();
                        cell.visible = true;
                    }
                    else {
                        // $(cell).hide();
                        cell.visible = false;
                    }
                });

                this.notifyListeners(appDataEvents.ON_COLS_REORDERED, {
                    DataSourceName: ds,
                    EventData: { Event: e }
                });

                let confEvent: BSConfigUpdatedEvent = { EventData: { Event: e, Action: appActions.COL_SHOW_HIDE }, DataSourceName: ds };
                this.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED, confEvent);

            });
        });
    }

    resizableGrid() {
        // console.log('resizableGrid is reached', this);

        var dataSourceName = this.options.dataSource.name;
        // console.log(table);
        var cols = this.head.getGridTitlesRow().cells;
        this.css = {};

        this.setCss('overflow', 'hidden');

        var tableHeight = this.element.offsetHeight;

        for (var i = 0; i < cols.length; i++) {
            var div = createDiv(tableHeight);
            cols[i].element.append(div);
            cols[i].setCss('position', 'relative');
            setListeners(div, cols[i], this);
        }

        /**
         * @param {HTMLDivElement} div
         * @param {BSDataTableCell} col         
         * @param {BSDataTable} table
         */
        function setListeners(div: HTMLDivElement, col: BSDataTableCell, table: BSDataTable) {
            var pageX: number
                , curCol: HTMLTableCellElement
                , curColWidth: number
                , nxtColWidth: number
                , tableWidth: number;

            div.addEventListener('mousedown', function (e) {

                tableWidth = table.element.offsetWidth;

                curCol = col.element as HTMLTableCellElement;
                pageX = e.pageX;

                var padding = paddingDiff(curCol);

                curColWidth = curCol.offsetWidth - padding;
            });

            div.addEventListener('mouseover', function (e) {
                this.style.borderRight = '2px solid #0000ff';
            })

            div.addEventListener('mouseout', function (e) {
                this.style.borderRight = '';
            })

            document.addEventListener('mousemove', function (e) {
                if (curCol) {
                    var diffX = e.pageX - pageX;

                    curCol.style.width = (curColWidth + diffX) + 'px';
                    table.element.style.width = tableWidth + diffX + "px";

                }
            });

            document.addEventListener('mouseup', function (e) {

                if (curCol) {


                    let confEvent: BSConfigUpdatedEvent = {
                        EventData: {
                            Event: e, CurrentCol: curCol
                            , Action: appActions.COL_RESIZED
                        }, DataSourceName: dataSourceName
                    };
                    table.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED, confEvent);
                }

                curCol = undefined;
                pageX = undefined;
                nxtColWidth = undefined;
                curColWidth = undefined
            });
        }

        /**
         * @param {string} height
         */
        function createDiv(height) {
            var div = document.createElement('div');
            div.style.top = "0";
            div.style.right = "0";
            div.style.width = '5px';
            div.style.position = 'absolute';
            div.style.cursor = 'col-resize';
            div.style.userSelect = 'none';
            div.style.height = height + 'px';
            return div;
        }

        function paddingDiff(col) {

            if (getStyleVal(col, 'box-sizing') == 'border-box') {
                return 0;
            }

            var padLeft = getStyleVal(col, 'padding-left');
            var padRight = getStyleVal(col, 'padding-right');
            return (parseInt(padLeft) + parseInt(padRight));

        }

        function getStyleVal(elm, css) {
            return (window.getComputedStyle(elm, null).getPropertyValue(css));
        }

    }

    enableColumnReordering() {

        // console.log('enableColumnReordering is reached', this);

        var dataSourceName = this.options.dataSource.name;
        var _this = this;
        //var gridId = $table.attr('id');
        //console.log('datasource-name', dataSourceName);
        var addWaitMarker = function () {
            // var dw = jq('<div></div>');
            // dw.addClass('wait-reorder').hide();
            // var ct = jq('<div class="d-flex justify-content-center"></div>');
            // var ds = jq('<div></div>').addClass('spinner-border');
            // ds.append('<span class="visually-hidden">Wait...</span>');
            // ct.append(ds);
            // dw.append(ct);
            // _this.addClass('caption-top');
            // var caption = jq('<caption></caption>').append(dw);
            // _this.element.append(caption);
        };

        var wrapper = document.createElement('div');
        wrapper.draggable = true;
        wrapper.classList.add('grid-header');

        var headerRow = _this.head.getGridTitlesRow();
        var cells = headerRow.cells;

        cells.forEach((cell) => {
            var childs = cell.childrenNodes();

            if (childs.length === 0) {
                var txt = cell.getText();
                cell.setText('');

                var el = document.createElement('div');
                el.textContent = txt;
                cell.appendChild(el);

                this.wrap(wrapper, el);
            }
            else {
                this.wrap(wrapper, childs);
            }

        });

        // addWaitMarker();

        var srcElement: HTMLElement;


        this.findElements('.grid-header').forEach((el) => {

            //
            // attach drag handlers to the element
            //
            this.addDragHandlers(el, {
                dragStart: function (e) {
                    if (!this.classList.contains('grid-header')) {
                        srcElement = undefined;
                        return;
                    };

                    srcElement = this;
                    this.style.opacity = '0.5';
                },
                dragLeave: function (e) {
                    e.preventDefault();
                    if (!srcElement) return;

                    if (!this.classList.contains('grid-header')) return;
                    this.classList.remove('over');
                },
                dragEnter: function (e) {
                    e.preventDefault();
                    if (!srcElement) return;

                    if (!this.classList.contains('grid-header')) return;

                    this.classList.add('over');
                    // e.preventDefault();
                },
                dragOver: function (e) {
                    e.preventDefault();
                    if (!srcElement) return;

                    if (!this.classList.contains('grid-header')) return;
                    this.classList.add('over');


                },
                dragEnd: function (e) {
                    e.preventDefault();
                    if (!srcElement) return;
                    this.style.opacity = '1';
                },
                drop: function (e) {
                    e.preventDefault();
                    if (!srcElement) return;
                    // var $this = jq(this);
                    this.classList.remove('over');
                    var destElement = this;
                    if (!this.classList.contains('grid-header')) return;
                    if (srcElement === destElement) return;

                    //var cols = _this.head.rows[0].cells;

                    // dest

                    var destParent = this.closest('th');
                    if (!destParent) return;

                    // lookup in cells
                    var desParentCell = cells.find((el) => el.element === destParent);
                    if (!desParentCell) return;

                    var toIndex = cells.indexOf(desParentCell);

                    // src
                    var srcParent = srcElement.closest('th');
                    if (!srcParent) return;

                    // lookup in cells
                    var srcParentCell = cells.find((el) => el.element === srcParent);
                    if (!desParentCell) return;

                    var fromIndex = cells.indexOf(srcParentCell);

                    //console.log(toIndex, fromIndex);

                    if (toIndex == fromIndex) return;

                    //
                    // apply new order to the headers
                    //
                    reOrder(headerRow, cells, fromIndex, toIndex);

                    var rows = _this.body.rows;
                    // jq('.wait-reorder').css({ 'cursor': 'progress' }).show();

                    //
                    // apply new order to all the rows in the grid
                    //
                    setTimeout(() => {
                        //console.log('Reordering started, ', new Date());
                        for (let index = 0; index < rows.length; index++) {
                            // debugger;
                            var row = rows[index];
                            var cells = row.cells
                            if (toIndex == fromIndex) return;
                            reOrder(row, cells, fromIndex, toIndex);
                        }

                        //console.log('Reordering completed, ', new Date());
                        //
                        // notify about column re-ordering
                        //
                        _this.notifyListeners(appDataEvents.ON_COLS_REORDERED,
                            { DataSourceName: dataSourceName, EventData: { Event: e } });

                        let confEvent: BSConfigUpdatedEvent = { EventData: { Event: e, Action: appActions.COL_REORDER }, DataSourceName: dataSourceName };
                        _this.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED, confEvent);

                        // jq('.wait-reorder').css({ 'cursor': '' }).hide();
                    }, 500);

                }
            })

        });

        var reOrder = function (/** @type {BSDataTableRow} */ row: BSDataTableRow
            , /** @type {BSDataTableCell[]} */ cells: BSDataTableCell[]
            , /** @type {number} */ fromIndex: number
            , /** @type {number} */ toIndex: number) {

            // debugger;
            if (fromIndex == toIndex) return;

            var dir = directions.ltr;

            if (fromIndex > toIndex) {
                dir = directions.rtl;
            }

            if (dir === directions.rtl) {
                swapRtl(cells, fromIndex, toIndex)
            }
            else {
                swapLtr(cells, fromIndex, toIndex);
            }

            // debugger;
            row.cells = [];
            row.addCells(cells);

            //jq(row).append(cells);
        };

        var swapRtl = function (/** @type {BSDataTableCell[]} */ cells: BSDataTableCell[]
            , /** @type {number} */ fromIndex: number
            , /** @type {number} */ toIndex: number) {
            for (let i = fromIndex; i > toIndex; i--) {
                swap(cells, i, i - 1);
            }
        };

        var swapLtr = function (/** @type {BSDataTableCell[]} */ cells: BSDataTableCell[]
            , /** @type {number} */ fromIndex: number
            , /** @type {number} */ toIndex: number) {
            for (let i = fromIndex; i < toIndex; i++) {
                swap(cells, i, i + 1);
            }
        };

        var swap = function (/** @type {BSDataTableCell[]} */ arr: BSDataTableCell[]
            , /** @type {number} */ ia: number
            , /** @type {number} */ ib: number) {
            var temp = arr[ia];
            arr[ia] = arr[ib];
            arr[ib] = temp;
        };

        var directions = { rtl: 'RIGHT-TO-LEFT', ltr: 'LEFT-TO-RIGHT' };
    }

    onGridConfigurationChanged(eventArgs: BSConfigUpdatedEvent) {
        // console.log('grid configuration updated', eventArgs);

        // debugger;

        var action = eventArgs.EventData.Action;
        var gridId = this.options.gridId;

        var cols = this.head.getGridTitlesRow().cells;
        // console.log(cols);
        var colsObj = {};
        cols.forEach((col, index) => {

            var prop = col.options.PropName;
            if (!prop) return;

            var asc = true;
            if (col.hasClass('sorting_desc'))
                asc = false;

            var colAttr: BSColumnSettings = { Width: col.getCss('width'), Visible: col.visible, Ascending: asc, Position: index }

            colsObj[prop] = colAttr;
        });



        CookieHelper.delete(gridId);
        setTimeout(() => {
            // console.log('Colsobject: ', colsObj);
            CookieHelper.setJSON(gridId, colsObj, { days: 30, secure: true, SameSite: 'strict' });
        }, 500);
    }

    onGridDataBound(eventArgs: BSEvent) {
        // console.log(eventArgs);

        // var grid = eventArgs.source;
        //
        // enables the configuration of columns
        //
        this.configurableGrid();

        //
        // enables to re-order the columns
        //
        this.enableColumnReordering();

        //
        // make the grid resixeable
        //
        this.resizableGrid();
    }
}
