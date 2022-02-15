
import { appActions as gridActions, appDataEvents, dataEventsService, CookieHelper, SessionStorageService } from "../services"
import { Tooltip, Modal } from "bootstrap"
import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableInput } from "./BSInput";
import '../services/string.extensions'

export class BSDataTable extends BSDataTableBase {

    options: BSDataTableOptions;
    head: BSDataTableHeader;
    body: BSDataTableBody;
    selectors: BSDataTableSelectorWindowCollection;
    paginator: BSDataTablePagination;
    httpClient: BSDataTableHttpClient;
    sessionCache: SessionStorageService;
    infiniteScroller: BSDataTableInfiniteScroll;    
    gridActions: BSDataTableActions;
    configurableGrid: () => void;
    resizableGrid: () => void;
    enableColumnReordering: () => void;
    onGridConfigurationChanged: (eventArgs: any) => void;
    onGridDataBound: (eventArgs: any) => void;
    

    constructor(options: BSDataTableOptions) {
        super();

        this.options = options;
        this.head = new BSDataTableHeader();
        this.body = new BSDataTableBody();
        this.selectors = new BSDataTableSelectorWindowCollection();
        this.paginator = new BSDataTablePagination(
            new BSDataTablePaginationOptions(this.options.dataSource.name,
                new BSDataTablePagingMetaData(),
                (page) => this.paginatorCallback(page)));

        this.sessionCache = new SessionStorageService();
        this.httpClient = new BSDataTableHttpClient(this.sessionCache, this.options.dataSource.name);
        this.infiniteScroller = null;
        this.gridActions = null;
    }

    /**
     * @param {number} page
     */
    paginatorCallback(page: number) {
        // console.log(`Page.Nbr: ${page} is requested`);
        this.fetchGridPage(page);
    }

    addHeader() {
        this.element.append(this.head.element);
    }

    addBody() {
        this.element.append(this.body.element);
    }

    render() {

        this.element = this.jquery('<table class="table table-bordered table-hover table-sm resizable navTable nowrap"></table>');

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

        var gridBodyRow = new BSDataTableRow({
            isTemplateRow: true,
            dataSourceName: this.options.dataSource.name,
            gridId: this.options.gridId,
            containerId: this.options.containerId
        });
        gridBodyRow.addClass('grid-rows');

        gridBodyRow.css = { 'display': 'none' };

        var gridColumns = this.applyColSorting(settings);

        //
        // add row markers - this helps to improve the visual appearance of selected row
        //
        var mh = new BSDataTableCell(new BSDataTableColDefinition(), true);

        var marker = new BSDataTableMarker();
        var mb = new BSDataTableCell(new BSDataTableColDefinition());
        mb.append(marker);

        gridHeaderRow.addCell(mh);
        gridBodyRow.addCell(mb);


        gridColumns.forEach((gc) => {

            //
            // the grid stores a cookie which contains info about the visiblity and size of the column
            // we will use this info to size and visualize the grid data
            //
            var colSettings = settings[gc.propName] || {};

            var th = gridHeaderRow.createHeaderFor(gc);
            var td = gridBodyRow.createInputFor(gc, this);

            //
            // sorting of the data when the header cell is clicked
            //
            this.addSorting(th);
            this.applyColSettings(th, colSettings);
            this.applyColSettings(td, colSettings);
            gridHeaderRow.addCell(th);
            gridBodyRow.addCell(td);
        });

        this.head.addRow(gridHeaderRow);
        this.body.addRow(gridBodyRow)

        //
        // add grid actions toolbar
        //
        this.addActions();

        //
        // add header and body to the grid
        //
        this.addHeader();
        this.addBody();

        //
        // add actions for the grid to the container
        //
        this.jquery('#' + this.options.containerId).append(this.gridActions.element);

        //
        // add grid to the provided container
        //
        this.jquery('#' + this.options.containerId).append(this.element);

        //
        // enable infinite scroll
        //
        this.addInfiniteScroll();

        //
        // add data to the grid
        //
        var data = this.options.dataSource.data.initData;
        var mdata = this.options.dataSource.data.metaData;
        this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD,
            {
                dataSourceName: this.options.dataSource.name,
                eventData: { items: data, metaData: mdata }
            });

        //
        // notify that grid is data-bound
        //
        this.notifyListeners(this.appDataEvents.ON_GRID_DATA_BOUND,
            {
                dataSourceName: this.options.dataSource.name,
                eventData: {}, source: this
            });

    };

    addInfiniteScroll() {
        if (this.options.enableInfiniteScroll === true) {
            this.infiniteScroller = new BSDataTableInfiniteScroll({ gridElement: this.element, httpClient: this.httpClient });
            this.infiniteScroller.nextPageCallback = (page) => this.paginatorCallback(page);
            this.infiniteScroller.enable();
        }
    }

    addActions() {
        this.gridActions = new BSDataTableActions();
        this.gridActions.dataSourceName = this.options.dataSource.name;
        this.gridActions.addNewRecordAction((e) => this.addEmptyRow())
            .addDeleteAction((e) => this.body.markDeleted())
            .addGridSettingsAction();
    }

    /**
     * @param {BSDataTableCell} th
     */
    addSorting(th: BSDataTableCell) {
        //
        // sorting of the data when the header cell is clicked
        //
        var _this = this;
        th.element.on('click', function (e) {

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
            th.element.siblings('th').removeClass('sorting_asc').removeClass('sorting_desc');

            //
            // notify that we need sorting of the column
            //
            var prop = th.getProp('data-th-propname');

            //
            // TODO: fix
            //
            th.notifyListeners(th.appDataEvents.ON_SORTING_REQUESTED,
                { dataSourceName: _this.options.dataSource.name, eventData: e, propName: prop, asc, source: _this });

        });
    }

    clearGrid() {
        this.find('.grid-row').remove();

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
    applyColSettings(col: BSDataTableCell, settings: any) {

        if (this.isEmptyObj(settings)) return;

        if (settings.visible === false) {
            col.element.hide();
        }

        if (settings.width) {
            col.css = { 'position': 'relative', 'width': settings.width };
        }
    };

    /**
     * Apply column re-ordering based on the stored cookie
     * This helps the user to not re-order the columns everytime they open the screen.
     * @param {*} settings 
     * @returns {BSDataTableColDefinition[]}
     */
    applyColSorting(settings) {

        if (!settings || this.isEmptyObj(settings)) return this.options.colDefinition;
        var sortedCols = [];

        this.options.colDefinition.forEach((v, i) => {
            var set = settings[v.propName];
            sortedCols[set.position] = v;
        });

        return sortedCols;
    }

    /**
     * @param {object[]} data
     * @param {BSDataTablePagingMetaData} [metaData]
     * @returns
     */
    bindDataSource(data, metaData) {

        // debugger;
        if (!data || data.length <= 0) return;

        var pagedData = data;
        if (this.options.dataSource.isRemote === false) {
            pagedData = this.options.dataSource.getPageOfflineCB(metaData.pageIndex, this.options.dataSource.data.initData, metaData);
        }

        /**
         * @type {BSDataTableRow}
         */
        var lastRow = null;
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
                this.infiniteScroller.observe(lastRow.element[0]);
            }
        }
    }


    /**
     * @param {BSDataTablePagingMetaData} [paginationModel]
     */
    bindPaginator(paginationModel = new BSDataTablePagingMetaData()) {
        this.paginator.options.pagingMetaData = paginationModel;
        this.paginator.render();
        this.jquery('#' + this.options.containerId).append(this.paginator.element);
    }

    /**
     * @param {{ [x: string]: any; }} rowData
     * @param {boolean} isExistingRecord
     */
    addNewRow(rowData, isExistingRecord) {
        var rowNumber = this.body.getNextRowIndex();
        var row = this.body.getTemplateRow().clone();
        row.options.isTemplateRow = false;

        row.addClass('grid-row');
        row.css = { 'display': 'table-row' };

        var _this = this;

        var inputs = row.getInputs();

        // debugger;

        inputs.forEach(function (v, i) {
            var input = v;

            var oldId = input.id;
            input.id = oldId + "_" + rowNumber;

            var cellPropName = input.modelName;
            // console.log('cell-pro', cellPropName);

            var cellVal = rowData[cellPropName];

            if (input.options.inputType === 'date' && cellVal) {
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

            input.element.on('change', (e) => {

                row.prop('data-isdirty', true);

                var rowCat = row.rowCategory;
                if (rowCat !== 'ADDED') {
                    row.rowCategory = 'UPDATED';
                }

                // remove any previous errors
                input.removeClass('is-invalid').prop('title', '');

                var tooltip = Tooltip.getInstance(e.target);
                if (tooltip)
                    tooltip.dispose();

                var rowData = row.getRowDataExt();

                row.notifyListeners(_this.appDataEvents.ON_GRID_UPDATED,
                    { dataSourceName: _this.options.dataSource.name, eventData: e });

                row.notifyListeners(_this.appDataEvents.ON_FIELD_UPDATED,
                    { dataSourceName: _this.options.dataSource.name, eventData: { row: rowData, field: input } });

                row.notifyListeners(_this.appDataEvents.ON_ROW_UPDATED,
                    { dataSourceName: _this.options.dataSource.name, eventData: rowData });

            });

            input.element.on('focus', function (e) {
                _this.body.focusRow(row);
            });
        });

        row.element.on('click', function (e) {
            _this.body.focusRow(row);
        });

        this.body.addRow(row);

        var visibleInputs = row.getVisibleInputs();

        if (visibleInputs.length > 0) {
            var lastInput = visibleInputs[visibleInputs.length - 1];

            lastInput.element.on('keydown', (e) => this.onInputKeyDown(row, e));
        }

        return row;

    };

    toDateDisplayFormat(date) {

        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;

        return year + "-" + month + "-" + day;
    }

    toTimeDisplayFormat(date) {
        var hour = date.getHours(),
            min = date.getMinutes();

        hour = (hour < 10 ? "0" : "") + hour;
        min = (min < 10 ? "0" : "") + min;

        return hour + ":" + min;
    }

    /**
     * 
     * @param {BSDataTableRow} row 
     * @param {*} e 
     * @returns 
     */
    onInputKeyDown(row, e) {

        //
        // insert a new row if its the last input in the row
        //   

        if (e.which !== 9 || e.shiftKey === true) return;
        // debugger;
        var visibleRows = this.body.getVisibleRows();
        if (visibleRows.length <= 0) return;
        var lastRowIndex = visibleRows[visibleRows.length - 1].getRowIndex();
        var parentIndex = row.getRowIndex();

        // console.log(gridRows, currentRowIndex);
        if (lastRowIndex === parentIndex) {
            var eRow = this.addEmptyRow();
        }
    };

    addEmptyRow() {
        //var rowCount = this.jquery('#' + this.options.gridId).find('tbody>tr').length;
        var emptyRow = this.addNewRow(this.createEmptyRowData(), false);

        var inputs = emptyRow.getVisibleInputs();
        if (inputs.length > 0) {
            inputs[0].focus();
        }

        emptyRow.rowCategory = 'ADDED'
        emptyRow.prop('data-isdirty', 'true');

        this.notifyListeners(this.appDataEvents.ON_GRID_UPDATED, { dataSourceName: this.options.dataSource.name, eventData: emptyRow });

        this.infiniteScroller.unobserve();
        this.infiniteScroller.observe(emptyRow.element[0]);

        return emptyRow;
    };

    createEmptyRowData() {
        var record = {};
        this.options.colDefinition.forEach((v, i) => { record[v.propName] = undefined })
        //debugger;
        return record;
    };

    /**
     * 
     * @param {BSDataTableEventArgs} eventArgs 
     * @returns 
     */
    onHeaderNext(eventArgs, fetchGrid) {

        if (!eventArgs || !eventArgs.eventData) return;

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
    fetchGridPage(pageIndex) {

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
            this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD,
                {
                    dataSourceName: this.options.dataSource.name,
                    eventData: {
                        items: data,
                        metaData: new BSDataTablePagingMetaData(pageIndex, mdata.pageSize, mdata.totalRecords)
                    }
                });

        }

    }

    onSaveRecord(eventArgs) {

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

    /**
     * 
     * @param {BSDataTableEventArgs} eventArgs 
     * @returns 
     */
    onSaveError(eventArgs) {

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

        if (!eventArgs || !eventArgs.eventData || !eventArgs.eventData.responseJSON) return;
        var errors = eventArgs.eventData.responseJSON;
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

                    var propName = col.propName.toPascalCaseJson();
                    var inputError = errors[dsName + '[' + serverIndex + '].' + propName];
                    if (inputError && inputError.length > 0) {
                        var input = errorRow.find("input[data-propname=" + col.propName + "]");

                        if (!input || input.length <= 0) {
                            input = errorRow.find("select[data-propname=" + col.propName + "]");
                            console.log('select found');
                        }

                        if (input && input.length > 0) {
                            input.addClass('is-invalid');
                            //console.log(inputError);
                            var allErrors = '';
                            Array.from(inputError).forEach(function (er) {
                                allErrors += er + ' ';
                            });
                            input.attr('title', allErrors);
                            var tooltip = new Tooltip(input[0], { customClass: 'tooltip-error' });
                        }
                    }

                });
            }
        }

    }

    getRowByIndex(index) {
        return this.body.rows.find((v, i) => v.getRowIndex() === index);
    }

    /**
     * @param {BSDataTableCell} th
     * @param {boolean} ascX
     */
    sortTable(th, ascX) {

        //  console.log('sorting', ascX);
        const getCellValue = (/** @type {BSDataTableRow} */ tr, /** @type {number} */ idx) => {
            var child = tr.cells[idx].element;
            // console.log('idx: ', idx,  child);
            var text = child.find('input, select').is(":checked") || child.find('input, select').val() || child.text();
            //console.log(text);
            return text;
        };


        // Returns a function responsible for sorting a specific column index 
        // (idx = columnIndex, asc = ascending order?).
        var comparer = function (/** @type {number} */ idx, /** @type {boolean} */ asc) {
            //console.log('idx: ', idx, 'asc: ', asc);
            // This is used by the array.sort() function...
            return function (/** @type {BSDataTableRow} */ a, /** @type {BSDataTableRow} */ b) {
                //console.log('a: ', a, 'b: ', b);

                // This is a transient function, that is called straight away. 
                // It allows passing in different order of args, based on 
                // the ascending/descending order.
                return function (v1, v2) {
                    //  console.log('v1: ', v1, 'v2: ', v2);
                    // sort based on a numeric or localeCompare, based on type...
                    return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
                        ? v1 - v2
                        : v1.toString().localeCompare(v2);
                }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
            }
        };

        // do the work...
        // const table = th.closest('table');

        //debugger;
        var dataSourceName = this.options.dataSource.name;
        // console.log(rows);
        var list = this.body.rows.sort(comparer(this.head.getGridTitlesRow().cells.indexOf(th), ascX = !ascX));

        list.forEach(tr => this.body.append(tr, false));

        this.notifyListeners(appDataEvents.ON_COLS_REORDERED,
            { dataSourceName: dataSourceName, eventData: { th, asc: ascX }, source: this });

        this.notifyListeners(this.appDataEvents.ON_GRID_CONFIG_UPDATED,
            { dataSourceName: dataSourceName, eventData: { th, asc: ascX }, source: this, action: this.appActions.COL_SORTING });

    };

    /**
     * 
     * @param {BSDataTableEventArgs} eventArgs 
     * @returns 
     */
    onSortingRequest(eventArgs) {
        // console.log(eventArgs);

        var $target = this.jquery(eventArgs.eventData.target);

        var isTh = $target.prop('tagName').toLowerCase() === 'th';

        if (!isTh) {
            var th = $target.parents('th');
            if (!th || th.length === 0) return;

            eventArgs.eventData.target = th[0];


        }
        var thx = this.head.getGridTitlesRow().cells.find((v, i) => v.element[0] === eventArgs.eventData.target);
        // debugger;
        this.sortTable(thx, eventArgs.asc);
    };

    resetSorting() {

        this.head.rows.forEach((v, i) => {
            if (v.hasClass('sorting_desc' || v.hasClass('sorting_asc'))) {
                v.removeClass('sorting_asc').removeClass('sorting_desc');
            }
        });
    };

    /**
     * 
     * @param {BSDataTableEventArgs} eventArgs 
     */
    onColsReordered(eventArgs) {

        //
        // modify 'keydown' events on the row inputs
        //
        var grid = this;
        // console.log(eventArgs);


        grid.body.rows.forEach((row, i) => {
            var inputs = row.getInputs();
            inputs.forEach((inp) => { inp.element.off('keydown') });
            var visibleInputs = row.getVisibleInputs();
            if (visibleInputs.length <= 0) return;
            var lastInput = visibleInputs[visibleInputs.length - 1];
            lastInput.element.on('keydown', (e) => { this.onInputKeyDown(row, e) });
        });

    };

    registerCallback(key, eventTypeX, callback, dataSourceNameX, verifyDSName = false) {
        dataEventsService.registerCallback(key, eventTypeX, callback, dataSourceNameX, verifyDSName);
    };

    unRegisterCallback(key, eventTypeX, dataSourceNameX) {
        dataEventsService.unRegisterCallback(key, eventTypeX, dataSourceNameX);
    };

    /**
     * @param {string} eventType
     * @param {(source: BSDataTable, eventObject: object) => any} handler
     */
    addHandler(eventType, handler, verifyDSName = false) {
        var id = this.options.gridId;
        var ds = this.options.dataSource.name;
        this.registerCallback(id, eventType, (/** @type {Object} */ ev) => handler(this, ev), ds, verifyDSName);
    }

    removeHandler(eventType) {
        var id = this.options.gridId;
        var ds = this.options.dataSource.name;
        this.unRegisterCallback(id, eventType, ds);

    }

    onFetchData(eventArgs) {

        // console.log('onFetchData:', eventArgs);

        //
        // populate the grid with the fetched data
        //
        if (this.options.enableInfiniteScroll === false)
            this.clearGrid();
        var md = eventArgs.eventData.metaData;
        if (!md) return;
        this.bindDataSource(eventArgs.eventData.items, new BSDataTablePagingMetaData(md.pageIndex, md.pageSize, md.totalRecords));
    }

    onFetchDataError(eventArgs) {
        // console.error('onFetchDataError: ', eventArgs);
    }

    registerCallbacks(verifyDSName = true) {
        // debugger;
        var id = this.options.gridId;
        var ds = this.options.dataSource.name;

        //
        // subscribe to main view/form events
        //
        this.registerCallback(id, appDataEvents.GRID_DATA, () => this.body.getDirtyRecords(), ds);
        this.registerCallback(id, appDataEvents.ON_ADD_RECORD, (a) => this.onHeaderNext(a, false), ds);
        this.registerCallback(id, appDataEvents.ON_FETCH_RECORD, (a) => this.onHeaderNext(a, true), ds);
        this.registerCallback(id, appDataEvents.ON_SAVE_RECORD, (a) => this.onSaveRecord(a), ds);
        this.registerCallback(id, appDataEvents.ON_SAVE_ERROR, (a) => this.onSaveError(a), ds);

        //
        // subscribe to grid events
        //
        this.registerCallback(id, appDataEvents.ON_SORTING_REQUESTED, (a) => this.onSortingRequest(a), ds, verifyDSName);
        this.registerCallback(id, appDataEvents.ON_COLS_REORDERED, (a) => this.onColsReordered(a), ds, verifyDSName);
        this.registerCallback(id, appDataEvents.ON_GRID_CONFIG_UPDATED, (ev) => this.onGridConfigurationChanged(ev), ds, verifyDSName);
        this.registerCallback(id, appDataEvents.ON_GRID_DATA_BOUND, (ev) => this.onGridDataBound(ev), ds, verifyDSName);
        this.registerCallback(id, appDataEvents.ON_FETCH_GRID_RECORD, (ev) => this.onFetchData(ev), ds, verifyDSName);
        this.registerCallback(id, appDataEvents.ON_FETCH_GRID_RECORD_ERROR, (ev) => this.onFetchDataError(ev), ds, verifyDSName);
    } 
}

export class BSDataTableMarker extends BSDataTableBase {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery(`<i class="bi bi-caret-right row-marker"></i>`);
    }

    clone() {
        return super.clone();
    }
}

export class BSDataTableTextInput extends BSDataTableInput {
    constructor(options = { dataSourceName: "", inputType: 'text' }) {
        super(options);
        this.render();
    }

    render() {
        this.element = this.jquery(`<input type='${this.options.inputType}' /> `);
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableTextInput(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        c.addDoubleClickEvent();
        return c;
    }
}

export class BSDataTableCheckBox extends BSDataTableInput {
    constructor(options: { dataSourceName: string; inputType?: "checkbox" }) {
        super(options);
        this.render();
    }

    get val() {
        var val = this.element.is(':checked');
        return val === true ? "true" : "false";
    }

    /**
     * @param {string} v
     */
    set val(v: string) {
        this.element.val(v);
    }


    render() {
        this.element = this.jquery("<input type='checkbox' />");
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableCheckBox(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        this.addDoubleClickEvent();
        return c;
    }

}

export class BSDataTableSelectOption extends BSDataTableBase {
    options: BSDataTableSelectListItem;

    /**
     * 
     * @param {BSDataTableSelectListItem} options 
     */
    constructor(options: BSDataTableSelectListItem) {
        super();
        this.options = options;
        this.render();
    }

    render() {
        this.element = this.jquery("<option></option>");
        this.element.val(this.options.value);
        this.element.text(this.options.text);

        if (this.options.isSelected)
            this.element.attr('selected', 'selected');
    }

    clone() {
        var clone = super.clone();
        clone.setText(this.element.text());
        return clone;
    }
}

export class BSDataTableSelect extends BSDataTableInput {
    constructor(options) {
        super(options);
        this.render();
    }

    /**
     * @param {string} v
     */
    set val(v) {
        this.element.val(v);
        this.element.change();
    }

    get val() {
        return this.element.val();
    }

    render() {
        this.element = this.jquery("<select></select>");
    }

    clone() {
        var sc = super.clone();
        var c = new BSDataTableSelect(this.shClone(this.options));
        c.element = sc.element;
        c.children = sc.children;
        this.addDoubleClickEvent();

        return c;
    }


}

export class BSDataTableButton extends BSDataTableInput {
    /**
     * @param {{ inputType: string; dataSourceName: string; icon?:string; handler?:  (arg0: MouseEvent) => void}} options
     */
    constructor(options: { inputType: string; dataSourceName: string; icon?: string; handler?: (arg0: MouseEvent) => void; }) {
        super(options);
        this.options = options;
        this.render();
    }

    render() {
        var icon = this.options.icon ? `<i class="bi bi-${this.options.icon}"></i>` : '';
        this.element = this.jquery(`<button class="btn btn-outline-primary" type="button">${icon}</button>`);
        if (this.options.handler)
            this.addClickHandler();
    }

    addClickHandler() {
        this.element.on('click', (/** @type {MouseEvent} */ e) => this.options.handler(e));
    }

    clone() {
        var sc = super.clone();
        var btn = new BSDataTableButton(this.shClone(this.options));
        btn.children = sc.children;

        return btn;
    }
}

export class BSDataTableSelector extends BSDataTableInput {

    /**
     * @type {BSDataTableButton}
     */
    btnElement: BSDataTableButton;

    /**
     * @type {BSDataTableTextInput}
     */
    txtElement: BSDataTableTextInput;

    /**
     * @param {{dataSourceName:string, 
     * propName:string, 
     * inputType: string, 
     * cssClass: string, 
     * placeHolder: string, 
     * btnId: string, 
     * elementId: string,
     * btnClick: (sender:BSDataTableSelector, e:any)=> void }} options
     */
    constructor(options: {
        dataSourceName: string;
        propName: string;
        inputType: string;
        cssClass: string;
        placeHolder: string;
        btnId: string;
        elementId: string;
        btnClick: (sender: BSDataTableSelector, e: any) => void;
    }) {
        super(options);
        this.options = options;
        this.render();
    }

    /**
     * @param {BSDataTableSelectorWindow} sender
     * @param {any} e
     */
    onItemSelected(sender: BSDataTableSelectorWindow, e: any) {

        console.log('row selected', sender.grid.body.getSelectedRow());

        var row = sender.grid.body.getSelectedRow();
        var selectedInput = row.getInputs().find((input) => input.isKey);
        if (selectedInput) {
            // console.log('Selected value: ', selectedInput.val);
            // console.log('selector: ', this.txtElement.val);
            this.txtElement.val = selectedInput.val;
            this.txtElement.change(); // call change to fire the change event
        }
        sender.selectorModal.hide();
    }

    render() {

        this.txtElement = new BSDataTableTextInput(this.options);
        this.txtElement
            .addClass(this.options.cssClass)
            .props([{ key: "id", value: this.options.elementId },
            { key: "placeHolder", value: this.options.placeHolder },
            { key: "data-propname", value: this.options.propName }]);

        this.btnElement = new BSDataTableButton({
            inputType: 'button',
            dataSourceName: this.options.dataSourceName,
            icon: 'search',
            handler: (e) => this.options.btnClick(this, e)
        })

        var wrapper = this.jquery('<div class="input-group input-group-sm"></div>');
        this.element = wrapper.append(this.txtElement.element).append(this.btnElement.element);
    }

    clone() {
        // debugger;
        var sc = super.clone();
        var c = new BSDataTableSelector(this.shClone(this.options));
        c.children = sc.children;
        // c.addDoubleClickEvent(); // TODO: why it has to be in the clone method?  

        return c;
    }

}

export class BSDataTableCell extends BSDataTableBase {


    /**
     * @type {boolean}
     */
    isHeader: boolean;
    options: BSDataTableColDefinition;
    /**
     * @param {BSDataTableColDefinition} [options]
     */
    constructor(options: BSDataTableColDefinition, isHeader = false) {
        super();
        this.options = options || new BSDataTableColDefinition();
        this.isHeader = isHeader
        this.render();
    }

    render() {
        var rowSpan = this.options ? this.options.rowSpan : undefined;
        var colSpan = this.options ? this.options.colSpan : undefined;

        this.element =
            this.isHeader === true
                ? this.jquery("<th class='sorting ds-col'></th>")
                : this.jquery("<td></td>");

        if (rowSpan)
            this.element.attr('rowSpan', rowSpan);

        if (colSpan)
            this.element.attr('colSpan', colSpan);
    }

    clone() {
        // debugger;
        var sc = super.clone();
        var c = new BSDataTableCell(this.shClone(this.options), this.isHeader);
        c.children = sc.children;
        c.element = sc.element;
        return c;
    }
}

export class BSDataTableActions extends BSDataTableBase {


    /**
     * @type {string}
     */
    dataSourceName: string;
    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery('<div class="row actions-container"></div>')
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addDeleteAction(callback: (arg0: object) => any) {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-danger grid-toolbar-action" 
                                    id="btnDeleteRow_${this.dataSourceName}"><i class="bi bi-trash"></i>
                                </button>`);
        btn.on('click', callback);
        this.element.append(btn);
        return this;
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addNewRecordAction(callback: (arg0: object) => any) {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
                                    id="btnAddRow_${this.dataSourceName}"><i class="bi bi-plus-circle"></i>
                                </button>'`);
        btn.on('click', callback);
        this.element.append(btn);
        return this;
    }

    addGridSettingsAction() {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
                                    data-bs-toggle="modal" data-bs-target="#staticBackdrop_${this.dataSourceName}" 
                                    id="btnSettings_${this.dataSourceName}"><i class="bi bi-gear"></i>
                                </button>`);
        this.element.append(btn);
        return this;
    }

}

export class BSDataTableRowCollection extends BSDataTableBase {
    /**
     * @type BSDataTableRow[]
     */
    rows: BSDataTableRow[] = [];

    constructor() {
        super();
    }

    /**
     * 
     * @param {BSDataTableRow} row 
     */
    addRow(row: BSDataTableRow) {
        this.element.append(row.element);
        var index = this.getNextRowIndex();
        row.prop('data-rowindex', index);

        var rType = row.options.gridHeader === true ? 'head' : 'data';
        row.prop('id', `${row.options.gridId}_${rType}_${index}`);
        this.rows.push(row);
        return this;
    }

    getVisibleRows() {
        return this.rows.filter((row) => row.visible === true);
    }

    getNextRowIndex() {
        return this.rows.length + 1;
    }

    // getActionsRow() {
    //     return this.rows.find((row) => row.options.isActionsRow === true);
    // }

    getGridTitlesRow() {
        return this.rows.find((row) => row.options.gridHeader === true);
    }
}

export class BSDataTableHeader extends BSDataTableRowCollection {


    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery('<thead class="table-light"></thead>');
    }

}

export class BSDataTableBody extends BSDataTableRowCollection {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery("<tbody></tbody>");
    }

    /**
    * @param {BSDataTableRow} row
    */
    rowSiblings(row: BSDataTableRow) {
        return this.rows.filter((v, i) => {
            if (v !== row) return v; // return all except the current row
        })
    }

    /**
     * @param {BSDataTableRow} row
     */
    focusRow(row: BSDataTableRow) {
        row.removeClass('table-active').addClass('table-active');
        var siblings = this.rowSiblings(row);
        siblings.forEach((v, i) => v.removeClass('table-active'));
    };



    getTemplateRow() {
        var result = this.rows.filter(function (v) {
            if (v.options.isTemplateRow === true) return v;
        });

        if (result && result.length > 0) return result[0];
    }

    getDirtyRows() {
        var rows = this.rows.filter((v, i) => v.isRowDirty());
        return rows;
    }

    getDirtyRecords() {
        var dirtyRows = this.getDirtyRows();

        if (dirtyRows.length === 0) {
            return [];
        }
        var records = [];
        dirtyRows.forEach((row, i) => {
            records.push(row.getRowData());
        })

        return records;
    }

    getSelectedRow() {
        return this.rows.find((v, i) => v.hasClass('table-active'));
    }


    markDeleted() {
        var row = this.getSelectedRow();
        if (!row) return;

        var siblings = this.rowSiblings(row);
        var lastSibling = siblings[siblings.length - 1];
        row.removeClass('table-active');
        row.prop('data-isdirty', 'true');
        row.css = { 'display': 'none' };

        var rowCat = row.rowCategory;
        if (rowCat === 'ADDED') {
            row.rowCategory = 'ADDED_DELETED';
        }
        else {
            row.rowCategory = 'DELETED';
        }

        this.notifyListeners(this.appDataEvents.ON_GRID_UPDATED, { dataSourceName: row.options.dataSourceName, eventData: row });

        this.focusRow(lastSibling);
    }

    /**
     * Removes the row from rows collection
     * @param {BSDataTableRow} row 
     */
    removeRow(row: BSDataTableRow) {

        // this.find(`tr[data-rowcategory='${row.rowCategory}']`).remove();
        row.element.remove();

        var index = this.rows.indexOf(row);
        if (index > -1)
            this.rows.splice(index, 1);
    }

}

export class BSDataTableRow extends BSDataTableBase {

    /**
     * @type BSDataTableCell[]
     */
    cells: BSDataTableCell[] = [];
    options: any;

    /**
     * @param {{ dataSourceName: string; gridId: string; gridHeader?: boolean; isTemplateRow?: boolean; containerId?:string}} options
     */
    constructor(options: {
        dataSourceName: string; gridId: string;
        gridHeader?: boolean; isTemplateRow?: boolean; containerId?: string;
    }) {
        super();
        this.options = options;
        this.render();
    }

    get rowCategory() {
        return this.element.prop('data-rowcategory');
    }

    set rowCategory(v) {
        this.element.prop('data-rowcategory', v);
    }

    /**
    * 
    * @param {BSDataTableCell} cell 
    */
    addCell(cell: BSDataTableCell) {
        this.element.append(cell.element);
        this.cells.push(cell);
    }

    /**
     * @param {BSDataTableCell[]} cells
     */
    addCells(cells: any[]) {
        cells.forEach((cell) => this.addCell(cell));
    }

    render() {
        if (!this.element)
            this.element = this.jquery("<tr></tr>")
    }

    /**
     * 
     * @returns {BSDataTableRow}
     */
    clone(): BSDataTableRow {
        //var clone = this.element.clone();
        //return new BSDataTableRow({ element: clone, dataSourceName: this.dataSourceName });
        //let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        //return clone;
        var parentClone = super.clone();
        //debugger;
        let optClone = this.shClone(this.options);
        optClone.isTemplateRow = false;
        var cloneRow = new BSDataTableRow(optClone);
        cloneRow.element = parentClone.element;
        cloneRow.children = parentClone.children;
        cloneRow.cells = this.cells.map((v) => {
            var cloneCell = v.clone();
            cloneRow.element.append(cloneCell.element);
            return cloneCell;
        });

        return cloneRow;
    }

    focusRow() {
        this.removeClass('table-active').addClass('table-active');
    }

    getInputs() {
        /**
         * @type BSDataTableInput[]
         */
        var inputs = [];

        // debugger;
        this.cells.forEach((val, idx) => {
            var children = val.children;
            if (children.length > 0) {
                children.forEach((v, i) => {
                    if (v instanceof BSDataTableSelector)
                        inputs.push(v.txtElement);
                    else if (v instanceof BSDataTableInput)
                        inputs.push(v);
                    // if (v instanceof BSDataTableInput)
                    //     inputs.push(v);
                });
            }
        });
        return inputs;
    }


    /**
     * @param {BSDataTableColDefinition} model
     * @param {BSDataTable} grid instance
     * @returns {BSDataTableCell} returns the grid cell containing the input
     */
    createInputFor(model: BSDataTableColDefinition, grid: BSDataTable): BSDataTableCell {
        var ds = this.options.dataSourceName;
        var gid = this.options.gridId;

        var input = null;

        //debugger;
        if (model.dataType === 'select') {
            input = new BSDataTableSelect({ dataSourceName: ds });
            model.dataSource
                .forEach((opt) => input.append(new BSDataTableSelectOption(opt)));
            input.addClass('form-select form-select-sm');
        }
        else if (model.dataType === 'checkbox') {
            input = new BSDataTableCheckBox({ dataSourceName: ds });
        }
        else if (model.dataType === 'selector') {
            // TODO: Fix two types of settings!!!
            var sWindow = new BSDataTableSelectorWindow({
                propName: model.propName,
                containerId: this.options.containerId,
                urlCb: model.selectorDataCB,
                gridCols: model.selectorCols
            });

            grid.selectors.add(sWindow);

            input = new BSDataTableSelector({
                dataSourceName: ds,
                propName: model.propName,
                btnId: "btn_" + gid + "_template_row_" + model.propName,
                cssClass: "form-control form-control-sm",
                elementId: gid + "_template_row_" + model.propName,
                inputType: "text",
                placeHolder: model.name,
                btnClick: (sender, e) => {
                    sWindow.grid.removeHandler(this.appDataEvents.ON_ROW_DOUBLE_CLICKED);
                    sWindow.grid.addHandler(this.appDataEvents.ON_ROW_DOUBLE_CLICKED, (s, ev) => sender.onItemSelected(sWindow, ev));
                    sWindow.show();
                }
            });

        }
        else {
            input = new BSDataTableTextInput({
                dataSourceName: ds,
                inputType: model.dataType
            });
            input.addClass('form-control form-control-sm');
        }
        // TODO: Fix two types of settings!!!
        if (model.dataType !== 'selector')
            input.props([
                { key: 'data-propname', value: model.propName },
                { key: 'title', value: model.name },
                { key: 'id', value: gid + "_template_row_" + model.propName },
                { key: 'placeholder', value: model.name }
            ]);

        if (model.isKey === true) {
            input.readonly = true;
            input.isKey = true;
        }

        if (grid.options.isReadonly === true) {
            input.readonly = true;
            input.setCss('cursor', 'pointer');
            input.setCss('user-select', 'none');
        }

        var td = new BSDataTableCell(new BSDataTableColDefinition());
        td.append(input);
        return td;

    }

    /**
     * @param {BSDataTableColDefinition} model
     */
    createHeaderFor(model: BSDataTableColDefinition) {
        var th = new BSDataTableCell(model, true);
        th.addClass('sorting').addClass('ds-col');
        th.setText(model.name);
        th.prop('data-th-propname', model.propName);
        return th;
    }

    getVisibleInputs() {
        var inputs = this.getInputs();
        return inputs.filter((input) => input.visible === true);
    }

    getRowDataExt() {
        var rowInputs = this.getInputs();
        var record = {};
        rowInputs.forEach((rowInput, i) => {
            var cellPropName = rowInput.modelName;
            record[cellPropName] = rowInput;
        });
        return record;
    }

    getRowIndex() {
        var rowIndex = this.getProp('data-rowindex');
        return parseInt(rowIndex);
    }

    getRowData() {
        var rowInputs = this.getInputs();
        var rowIndex = this.getRowIndex();
        var record = {};
        var rowCat = this.rowCategory;
        record['rowCategory'] = rowCat;

        rowInputs.forEach((rowInput, i) => {
            var cellPropName = rowInput.modelName;
            record[cellPropName] = rowInput.val;
        });
        record["clientRowNumber"] = rowIndex;
        // console.log('GetRowData: ', record);
        return record;
    }

    isRowDirty() {
        return this.getProp('data-isdirty') === 'true';
    }
}

export class BSDataTableOptions {
    gridId: string;
    containerId: string;
    colDefinition: BSDataTableColDefinition[];
    dataSource: BSDataTableDataSource;
    isReadonly: boolean;
    enableInfiniteScroll: boolean;

    /**
     * 
     * @param {string} gridId 
     * @param {string} containerId
     * @param {BSDataTableColDefinition[]} colDefinition 
     * @param {BSDataTableDataSource} dataSource 
     * @param {boolean} isReadonly
     */
    constructor(gridId: string, containerId: string,
        colDefinition: BSDataTableColDefinition[], dataSource: BSDataTableDataSource, isReadonly: boolean = false) {
        this.gridId = gridId;
        this.containerId = containerId;
        this.colDefinition = colDefinition;
        this.dataSource = dataSource;
        this.isReadonly = isReadonly;
        this.enableInfiniteScroll = true;
    }
}

export class BSDataTableColDefinition {
    name: string;
    dataType: string;
    width: string;
    propName: string;
    isKey: boolean;
    dataSource: BSDataTableSelectListItem[];
    colSpan: number;
    rowSpan: number;
    selectorDataCB: getUrlCallback;
    selectorCols: BSDataTableColDefinition[];

    /**
     * @param {string} [name]
     * @param {string} [dataType]
     * @param {string} [width]
     * @param {string} [propName]
     * @param {boolean} [isKey]
     * @param {BSDataTableSelectListItem[]} [dataSource]
     * @param {number} [colSpan]
     * @param {number} [rowSpan]
     * @param {getUrlCallback} [selectorDataCB] - a cb to return the page url
     * @param {BSDataTableColDefinition[]} [selectorCols] - cols def for selector
     */
    constructor(name?: string, dataType?: string, width?: string, propName?: string, isKey?: boolean,
        dataSource?: BSDataTableSelectListItem[], colSpan?: number, rowSpan?: number,
        selectorDataCB?: getUrlCallback, selectorCols?: BSDataTableColDefinition[]) {
        this.name = name;
        this.dataType = dataType;
        this.width = width;
        this.propName = propName;
        this.isKey = isKey;
        this.dataSource = dataSource;
        this.colSpan = colSpan;
        this.rowSpan = rowSpan;
        this.selectorDataCB = selectorDataCB;
        this.selectorCols = selectorCols;
    }
}



/**
 * Url CB type
 * @callback getUrlCallback
 * @param {number} pageIndex
 * @returns {string} url to access next page
 */
interface getUrlCallback { (pageIndex: number): string };

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

export class BSDataTableSelectListItem {
    text: any;
    value: any;
    isSelected: boolean;

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

export class BSDataTableEventArgs {
    source: any;
    eventData: any;
    dsName: any;
    asc: boolean;
    idField: any;
    /**
     * @param {BSDataTable} source
     * @param {object} eventData
     * @param {string} dsName
     * @param {string} idField
     */
    constructor(source: BSDataTable, eventData: object, dsName: string, asc = true, idField: string = undefined) {
        this.source = source;
        this.eventData = eventData;
        this.dsName = dsName;
        this.asc = asc;
        this.idField = idField;
    }
}

BSDataTable.prototype.configurableGrid = function () {
    // console.log('configurableGrid is reached', this);
    var headers = this.head.getGridTitlesRow().cells;
    var dataSourceName = this.options.dataSource.name;

    //
    // A modal for configuring grid columns.
    // The modal ahs an <ul> element which will be populated below with grid columns check-list.
    // the checks can be used to show/hide a particular grid column
    //
    var modelTemplate =
        `<div class="settings-menu grid-config-template">
            <div class="modal fade" id="staticBackdrop_${this.options.dataSource.name}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel_${this.options.dataSource.name}">Configure columns</h5>
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
            </div>
        </div>`;
    var modalElem = this.jquery(modelTemplate);
    this.jquery('#' + this.options.containerId).append(modalElem);
    // this.append(modalElem, false);

    var colsList = modalElem.find('.grid-config-cols');
    headers.forEach((header, index) => {

        var propName = header.getProp('data-th-propname');
        if (!propName) return;

        var colsListItem = this.jquery('<li class="list-group-item"></li>');

        var chk = this.jquery('<input type="checkbox" value="" class="form-check-input me-1" />');
        var chkId = 'col_config_chk_' + propName;
        chk.attr('id', chkId);
        chk.attr('data-config-propname', propName);
        if (header.visible === true) {
            chk.attr('checked', 'checked');
        }

        var chkLbl = this.jquery('<label for="' + chkId + '"></label>');
        // debugger;
        chkLbl.text(header.getText());

        colsListItem.append(chk);
        colsListItem.append(chkLbl);
        colsList.append(colsListItem);

        chk.on('click', (e) => {
            var $chk = this.jquery(e.target);
            var prop = $chk.attr('data-config-propname');
            if (!prop) return;

            var headerRow = this.head.getGridTitlesRow();
            // var col = this.find('th[data-th-propname=' + prop + ']');
            var col = headerRow.cells.find((cell) => cell.getProp('data-th-propname') === prop);
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

                if ($chk.is(':checked') === true) {
                    // $(cell).show();
                    cell.visible = true;
                }
                else {
                    // $(cell).hide();
                    cell.visible = false;
                }
            });

            this.notifyListeners(appDataEvents.ON_COLS_REORDERED,
                { dataSourceName: dataSourceName, eventData: e, source: this });

            this.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED,
                { dataSourceName: dataSourceName, eventData: e, source: this, action: gridActions.COL_SHOW_HIDE });

        });
    });
}

BSDataTable.prototype.resizableGrid = function () {
    // console.log('resizableGrid is reached', this);

    var dataSourceName = this.options.dataSource.name;
    // console.log(table);
    var cols = this.head.getGridTitlesRow().cells;
    this.css = {};

    this.setCss('overflow', 'hidden');

    var tableHeight = this.element[0].offsetHeight;

    for (var i = 0; i < cols.length; i++) {
        var div = createDiv(tableHeight);
        cols[i].element.append(div);
        cols[i].setCss('position', 'relative');
        setListeners(div, cols[i], this);
    }

    /**
     * @param {HTMLDivElement} div
     * @param {BSDataTable} table
     * @param {BSDataTableCell} col
     */
    function setListeners(div, col, table) {
        var pageX, /** @type {HTMLTableCellElement} */curCol, curColWidth, nxtColWidth, tableWidth;

        div.addEventListener('mousedown', function (e) {

            tableWidth = table.element[0].offsetWidth;

            curCol = col.element[0];
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
                table.element[0].style.width = tableWidth + diffX + "px";

            }
        });

        document.addEventListener('mouseup', function (e) {

            if (curCol) {
                table.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED,
                    {
                        dataSourceName: dataSourceName,
                        eventData: { e, curCol },
                        source: table,
                        action: gridActions.COL_RESIZED
                    });

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

BSDataTable.prototype.enableColumnReordering = function () {

    // console.log('enableColumnReordering is reached', this);

    var dataSourceName = this.options.dataSource.name;
    var jq = this.jquery;
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

    var thWrap = jq('<div draggable="true" class="grid-header"></div>');

    var headerRow = _this.head.getGridTitlesRow();
    var cells = headerRow.cells;

    cells.forEach((cell) => {
        var childs = cell.element.children();
        if (childs.length === 0) {
            var txt = cell.element.text();
            cell.element.text('');
            childs = jq('<div></div>').text(txt);
            cell.element.append(childs);
        }
        jq(childs).wrap(thWrap);
    });

    // addWaitMarker();

    var srcElement;

    //jQuery.event.props.push('dataTransfer');
    _this.find('.grid-header').on({
        dragstart: function (e) {
            if (!jq(this).hasClass('grid-header')) {
                srcElement = undefined;
                return;
            };

            srcElement = e.target;
            jq(this).css('opacity', '0.5');
        },
        dragleave: function (e) {
            e.preventDefault();
            if (!srcElement) return;

            if (!jq(this).hasClass('grid-header')) return;
            jq(this).removeClass('over');
        },
        dragenter: function (e) {
            e.preventDefault();
            if (!srcElement) return;

            if (!jq(this).hasClass('grid-header')) return;
            jq(this).addClass('over');
            // e.preventDefault();
        },
        dragover: function (e) {
            e.preventDefault();
            if (!srcElement) return;

            if (!jq(this).hasClass('grid-header')) return;
            jq(this).addClass('over');


        },
        dragend: function (e) {
            e.preventDefault();
            if (!srcElement) return;
            jq(this).css('opacity', '1');
        },
        drop: function (e) {
            e.preventDefault();
            if (!srcElement) return;
            var $this = jq(this);
            $this.removeClass('over');
            var destElement = e.target;
            if (!$this.hasClass('grid-header')) return;
            if (srcElement === destElement) return;

            //var cols = _this.head.rows[0].cells;

            // dest
            var destParent = $this.parents('th');
            if (!destParent || destParent.length <= 0) return;

            // lookup in cells
            var desParentCell = cells.find((el) => el.element[0] === destParent[0]);
            if (!desParentCell) return;

            var toIndex = cells.indexOf(desParentCell);

            // src
            var srcParent = jq(srcElement).parents('th');
            if (!srcParent || srcParent.length <= 0) return;

            // lookup in cells
            var srcParentCell = cells.find((el) => el.element[0] === srcParent[0]);
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
                    { dataSourceName: dataSourceName, eventData: e, source: _this });

                _this.notifyListeners(appDataEvents.ON_GRID_CONFIG_UPDATED,
                    { dataSourceName: dataSourceName, eventData: e, source: _this, action: gridActions.COL_REORDER });

                // jq('.wait-reorder').css({ 'cursor': '' }).hide();
            }, 500);

        }
    });

    var reOrder = function (/** @type {BSDataTableRow} */ row, /** @type {BSDataTableCell[]} */ cells, /** @type {number} */ fromIndex, /** @type {number} */ toIndex) {

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

    var swapRtl = function (/** @type {BSDataTableCell[]} */ cells, /** @type {number} */ fromIndex, /** @type {number} */ toIndex) {
        for (let i = fromIndex; i > toIndex; i--) {
            swap(cells, i, i - 1);
        }
    };

    var swapLtr = function (/** @type {BSDataTableCell[]} */ cells, /** @type {number} */ fromIndex, /** @type {number} */ toIndex) {
        for (let i = fromIndex; i < toIndex; i++) {
            swap(cells, i, i + 1);
        }
    };

    var swap = function (/** @type {BSDataTableCell[]} */ arr, /** @type {number} */ ia, /** @type {number} */ ib) {
        var temp = arr[ia];
        arr[ia] = arr[ib];
        arr[ib] = temp;
    };

    var directions = { rtl: 'RIGHT-TO-LEFT', ltr: 'LEFT-TO-RIGHT' };
}

BSDataTable.prototype.onGridConfigurationChanged = function (eventArgs) {
    // console.log('grid configuration updated', eventArgs);

    // debugger;

    var action = eventArgs.action;
    var gridId = this.options.gridId;

    var cols = this.head.getGridTitlesRow().cells;
    // console.log(cols);
    var colsObj = {};
    cols.forEach((col, index) => {

        var sort = 'asc';
        if (col.hasClass('sorting_desc'))
            sort = 'desc';

        var prop = col.getProp('data-th-propname');

        var colAttr = new BSDataTableColSettings(col.getCss('width'), col.visible, sort, index);

        colsObj[prop] = colAttr;
    });



    CookieHelper.delete(gridId);
    setTimeout(() => {
        // console.log('Colsobject: ', colsObj);
        CookieHelper.setJSON(gridId, colsObj, { days: 30, secure: true, SameSite: 'strict' });
    }, 500);
}

BSDataTable.prototype.onGridDataBound = function (eventArgs) {
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

export class BSDataTableColSettings {
    width: string;
    visible: boolean;
    sort: string;
    position: number;
    /**
     * @param {string} width
     * @param {boolean} visible
     * @param {string} sort asc|desc
     * @param {number} position
     */
    constructor(width: string, visible: boolean, sort: string, position: number) {
        this.width = width;
        this.visible = visible;
        this.sort = sort;
        this.position = position;
    }
}

export class BSDataTableHttpClient extends BSDataTableBase {
    sessionStorage: SessionStorageService;
    dataSourceName: string;

    constructor(sessionStorage: SessionStorageService, dataSourceName: string) {
        super();
        this.appDataEvents = appDataEvents;
        this.sessionStorage = sessionStorage;
        this.dataSourceName = dataSourceName;
    }


    /**
     * @param {BSDataTableHttpClientOptions} options
     */
    get(options: BSDataTableHttpClientOptions) {
        // debugger;
        var key = JSON.stringify(options);
        var value = this.sessionStorage.getItem(key);
        if (value) {
            this.notifyResponse(value);
            return;
        }

        var _this = this;
        var ajaxOptions = {
            url: options.url,
            method: 'GET',
            headers: options.headers ? options.headers : {}
        };
        this.jquery.ajax(ajaxOptions).then(function done(response) {
            // console.log(response);
            _this.sessionStorage.addItem(key, response, new Date(Date.now() + (10 * 60 * 1000)));// expires in 10 minutes
            _this.notifyResponse(response)

        }, function error(error) {
            _this.nofifyError(error, options);
        });

    };

    notifyResponse(response: any) {
        this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD, { dataSourceName: this.dataSourceName, eventData: response });
    }

    nofifyError(error: JQuery.jqXHR<any>, options: BSDataTableHttpClientOptions) {
        this.notifyListeners(this.appDataEvents.ON_FETCH_GRID_RECORD_ERROR,
            { dataSourceName: this.dataSourceName, eventData: error, recordId: options.recordId });
    }
}

export class BSDataTableHttpClientOptions {
    url: any;
    method: any;
    headers: any;
    recordId: any;
    cacheResponse: boolean;

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
        this.cacheResponse = true;
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

export class BSDataTablePagination extends BSDataTableBase {
    options: BSDataTablePaginationOptions;
    listId: string;
    containerId: string;

    /**
     * @param {BSDataTablePaginationOptions} options
     */
    constructor(options: BSDataTablePaginationOptions) {
        super();
        this.options = options;
        this.listId = `pg_list_${this.options.dsName}`;
        this.containerId = `pg_container_${this.options.dsName}`;
    }

    render() {
        if (this.element)
            this.element.remove();

        this.element =
            this.jquery(
                `<div class="bsgrid-pagination" id="${this.containerId}">
                        <nav aria-label="Page navigation">
                            
                        </nav>
                    </div>`);
        var pageList = this.jquery(`<ul class="pagination justify-content-end" id="${this.listId}"></ul>`);

        for (let index = 1; index <= this.options.pagingMetaData.totalPages && index <= 5; index++) {
            var li = this.jquery('<li class="page-item"></li>');
            var link = this.jquery(`<a class="page-link" href="#" data-p-index="${index}">${index}</a>`);
            li.append(link);
            pageList.append(li);

            link.on('click', (e) => {
                e.preventDefault();
                var index = this.jquery(e.target).attr('data-p-index');

                if (this.options.nextPageCallback)
                    this.options.nextPageCallback(parseInt(index));
            });
        };

        this.element.find('nav').append(pageList);
    }

    clear() {
        this.jquery('#' + this.listId).children('li').remove();
    }
}

export class BSDataTableInfiniteScroll extends BSDataTableBase {

    /**
     * @type {BSDataTablePagingMetaData} metadata
     */
    initMetaData: BSDataTablePagingMetaData;

    /**
     * @type {number}
     */
    currentPage: number;

    initData: object[];
    gridElement: JQuery;
    httpClient: BSDataTableHttpClient;
    s_area: string;
    observer: IntersectionObserver;
    target: HTMLElement;
    nextPageCallback: (page: number) => void;

    /**
     * @param {{ gridElement: any; httpClient: BSDataTableHttpClient }} options
     */
    constructor(options: { gridElement: JQuery; httpClient: BSDataTableHttpClient; }) {
        super();
        this.gridElement = options.gridElement;
        this.httpClient = options.httpClient;

        this.s_area = null;
        this.observer = null;
        this.target = null;

        // this.totalPages = null;
        this.currentPage = 1;
        this.initData = null;
        this.initMetaData = null;
        this.nextPageCallback = null;

    }

    /**
     * @param {IntersectionObserverEntry[]} entries
     * @param {IntersectionObserver} sender
     */
    observerCB(entries: IntersectionObserverEntry[], sender: IntersectionObserver) {
        var entry = entries[0];
        // console.log(entry);
        if (entry.isIntersecting === true) {
            // console.log('Observer is invoked. Entry: ', entry);
            // console.log('initdata: ', this.initData);
            // console.log('metadata: ', this.initMetaData);

            //
            // fetch next page if we still have more pages to read
            //
            if (this.currentPage < this.initMetaData.totalPages) {
                console.log('Infinite scroll: fetching next page#: ', this.currentPage + 1);
                this.currentPage++;
                this.nextPageCallback(this.currentPage);
            }
        }
    }

    observe(el: HTMLElement) {
        this.target = el;
        this.observer.observe(el);
    }

    unobserve() {
        this.observer.unobserve(this.target);
    }

    enable() {
        this.s_area = 'scroll_area_' + this.gridElement.attr('id');
        var scrollArea = this.jquery(`<div class="row" id="${this.s_area}" style="max-height: 200px; overflow-y: auto"></div>`);
        this.gridElement.wrap(scrollArea);

        // var root = this.jquery.find(`#${this.s_area}`);
        let options = {
            // root: root[0],
            root: this.jquery(`#${this.s_area}`)[0],
            rootMargin: '0px',
            threshold: 0.3,
            trackVisibility: false
        };

        this.observer = new IntersectionObserver((entries, sender) => this.observerCB(entries, sender), options);

        var rows = this.gridElement.find('tr');
        var lastRow = rows[rows.length - 1];
        var target = lastRow;
        // console.log(target, root);
        this.observe(target);
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

export class BSDataTableSelectorWindowCollection extends BSDataTableBase {

    /**@type BSDataTableSelectorWindow[] */
    items: BSDataTableSelectorWindow[];

    constructor() {
        super();
        this.items = [];
    }

    /**
     * @param {BSDataTableSelectorWindow} item
     */
    add(item: BSDataTableSelectorWindow) {
        if (!this.find(item.options.propName))
            this.items.push(item);
    }

    /**
     * @param {string} propName
     * @returns {BSDataTableSelectorWindow} Item that mataches the propName
     */
    findSelector(propName: string): BSDataTableSelectorWindow {
        return this.items.find((item) => item.options.propName === propName);
    }
}

export class BSDataTableSelectorWindow extends BSDataTableBase {

    selectorModal: Modal;
    grid: BSDataTable;
    options: { propName: string; containerId: string; urlCb: getUrlCallback; gridCols?: BSDataTableColDefinition[]; };
    parentContainerId: string;
    modalId: string;
    modalTitleId: string;
    containerId: string;
    gridId: string;
    onItemSelected: (sender: any, e: any) => void;

    /**
     * @param {{ propName: string; containerId: string; urlCb: getUrlCallback; gridCols: BSDataTableColDefinition[]}} options
     */
    constructor(options: { propName: string; containerId: string; urlCb: getUrlCallback; gridCols: BSDataTableColDefinition[]; }) {
        super();
        this.options = options;
        this.parentContainerId = this.options.containerId;
        this.modalId = `${this.parentContainerId}_bs_${this.options.propName}`;
        this.modalTitleId = `${this.parentContainerId}_lbs_${this.options.propName}`;
        this.containerId = `${this.parentContainerId}_cbs_${this.options.propName}`;
        this.gridId = `${this.parentContainerId}_g_${this.options.propName}`;
        this.render();
        this.grid = this.renderGrid();
        this.onItemSelected = (/** @type {BSDataTable} */ sender: BSDataTable, /** @type {any} */ e: any) => { console.log(); };
    }


    render() {

        var find = this.jquery('#' + this.parentContainerId).find('#' + this.modalId);
        if (find && find.length === 1) {
            this.element = find;
            this.selectorModal = Modal.getOrCreateInstance(find[0]);
        }
        else {
            var modelTemplate =
                `<div class="modal" id="${this.modalId}">
                        <div class="modal-dialog modal-dialog-scrollable">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${this.modalTitleId}">Select a value</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div id="${this.containerId}">

                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Ok</button>
                                </div>
                            </div>
                        </div>
                </div>`;

            this.element = this.jquery(modelTemplate);
            this.jquery('#' + this.parentContainerId).append(this.element);

            this.selectorModal = new Modal(this.element[0]);

            this.element[0].addEventListener('shown.bs.modal', (e) => {
                this.grid.clearGrid();
                this.grid.infiniteScroller.currentPage = 1;
                this.grid.fetchGridPage(1)
            });
        }
    }

    show() {
        this.selectorModal.show();
    }

    renderGrid() {
        //
        // grid shown in the selector window
        //
        var dataSource = new BSDataTableDataSource('bsSelector',
            {
                initData: [],
                metaData: undefined
            },
            true,
            this.options.urlCb
        );

        var bs = new BSDataTableOptions(this.gridId, this.containerId, this.options.gridCols, dataSource, true);
        // bs.enableInfiniteScroll = false;

        var grid = new BSDataTable(bs);
        grid.registerCallbacks();

        // grid.addHandler(grid.appDataEvents.ON_ROW_DOUBLE_CLICKED, this.onItemSelected);

        //
        // following events are linked to parent (primary view/form) and are not needed for selector
        //

        grid.removeHandler(this.appDataEvents.GRID_DATA);
        grid.removeHandler(this.appDataEvents.ON_ADD_RECORD);
        grid.removeHandler(this.appDataEvents.ON_FETCH_RECORD);
        grid.removeHandler(this.appDataEvents.ON_SAVE_RECORD);
        grid.removeHandler(this.appDataEvents.ON_SAVE_ERROR);

        grid.render();

        // hide actions
        grid.gridActions.visible = false;
        return grid;
    }
}


