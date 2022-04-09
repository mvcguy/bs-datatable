import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableCell } from "./BSDataTableCell";
import { BSDataTableColDefinition, BSRowOptions } from "../commonTypes/common-types";
import { BSDataTableTextInput } from "./BSDataTableTextInput";
import { BSDataTableCheckBox } from "./BSDataTableCheckBox";
import { BSDataTableSelect } from "./BSDataTableSelect";
import { BSDataTableSelector } from "./BSDataTableSelector";
import { BSDataTableSelectorWindow } from "./BSDataTableSelectorWindow";
import { BSDataTable } from "./BSDataTable";

export class BSDataTableRow extends BSDataTableBase {

    /**
     * @type BSDataTableCell[]
     */
    cells: BSDataTableCell[] = [];
    options: BSRowOptions;

    /**
     * @param {{ dataSourceName: string; gridId: string; gridHeader?: boolean; isTemplateRow?: boolean; containerId?:string}} options
     */
    constructor(options: BSRowOptions) {
        super();
        this.options = options;
        this.render();
    }

    get rowCategory() {
        return this.getProp('data-rowcategory');
    }

    set rowCategory(v) {
        this.prop('data-rowcategory', v);
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
            this.element = document.createElement('tr')
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
        let optClone: BSRowOptions = this.shClone(this.options);
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

    getInputs(): BSDataTableInput[] {
        /**
         * @type BSDataTableInput[]
         */
        var inputs: BSDataTableInput[] = [];

        // debugger;
        this.cells.forEach((cell, idx) => {
            var children = cell.children;
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
        if (model.DataType === 'select') {
            input = new BSDataTableSelect({DataSourceName: ds, SelectOptions: model.DataSource});
        }
        else if (model.DataType === 'checkbox') {
            input = new BSDataTableCheckBox(ds);
        }
        else if (model.DataType === 'selector') {
            // TODO: Fix two types of settings!!!
            var sWindow = new BSDataTableSelectorWindow({
                propName: model.PropName,
                containerId: this.options.containerId,
                urlCb: model.SelectorDataCB,
                gridCols: model.SelectorCols
            });

            grid.selectors.add(sWindow);

            input = new BSDataTableSelector({
                DataSourceName: ds,
                PropName: model.PropName,
                BtnId: "btn_" + gid + "_template_row_" + model.PropName,
                CssClass: "form-control form-control-sm",
                ElementId: gid + "_template_row_" + model.PropName,
                InputType: "text",
                PlaceHolder: model.Name,
                BtnClick: (sender: BSDataTableSelector, e) => {
                    sWindow.grid.removeHandler(this.appDataEvents.ON_ROW_DOUBLE_CLICKED);
                    sWindow.grid.addHandler(this.appDataEvents.ON_ROW_DOUBLE_CLICKED, (s, ev) => sender.onItemSelected(sWindow, ev));
                    sWindow.show();
                }
            });

        }
        else {
            input = new BSDataTableTextInput(ds, model.DataType);
            input.addClass('form-control', 'form-control-sm');
        }
        // TODO: Fix two types of settings!!!
        if (model.DataType !== 'selector')
            input.props([
                { key: 'data-propname', value: model.PropName },
                { key: 'title', value: model.Name },
                { key: 'id', value: gid + "_template_row_" + model.PropName },
                { key: 'placeholder', value: model.Name }
            ]);

        if (model.IsKey === true) {
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
        th.setText(model.Name);
        th.prop('data-th-propname', model.PropName);
        return th;
    }

    getVisibleInputs() {
        var inputs = this.getInputs();
        return inputs.filter((input) => input.visible === true);
    }

    /**
     * This function returns the row containing the actual inputs
     * @returns A row record containing actual inputs
     */
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

    /**
     * This function returns an object which contains the values of the all the inputs in the row
     * @returns Retuns an object which contains the values of the inputs
     */
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
