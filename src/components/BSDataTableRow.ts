import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableCell } from "./BSDataTableCell";
import { BSDataTableColDefinition, BSInputOptions, BSRowOptions, BSSelectOptions, BSSelectorOptions } from "../commonTypes/common-types";
import { BSDataTableTextInput } from "./BSDataTableTextInput";
import { BSDataTableCheckBox } from "./BSDataTableCheckBox";
import { BSDataTableSelect } from "./BSDataTableSelect";
import { BSDataTableSelector } from "./BSDataTableSelector";

export class BSDataTableRow extends BSDataTableBase {

    /**
     * @type BSDataTableCell[]
     */
    cells: BSDataTableCell[] = [];
    options: BSRowOptions;

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

    createInputFor(model: BSDataTableColDefinition, readonly: boolean): BSDataTableCell {
        var ds = this.options.dataSourceName;

        var input = null;
        var inputOptions: BSInputOptions = {
            DataSourceName: ds,
            ModelName: model.PropName,
            PlaceHolder: model.Name,
            Title: model.Name
        };

        //debugger;
        if (model.DataType === 'select') {
            var selectOptions: BSSelectOptions = { ...inputOptions, SelectOptions: model.SelectList };
            input = new BSDataTableSelect(selectOptions);
        }
        else if (model.DataType === 'checkbox') {
            input = new BSDataTableCheckBox(inputOptions);
        }
        else if (model.DataType === 'selector') {

            var sltrOptions: BSSelectorOptions = {
                ...inputOptions,
                ContainerId: this.options.containerId,
                UrlCb: model.SelectorDataCB,
                GridCols: model.SelectorCols
            };
            input = new BSDataTableSelector(sltrOptions);

        }
        else {
            input = new BSDataTableTextInput(inputOptions);
        }

        if (model.IsKey === true) {
            input.readonly = true;
            input.isKey = true;
        }

        if (readonly === true) {
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
    getRowDataExt(): any {
        var rowInputs = this.getInputs();
        var record = {};
        rowInputs.forEach((rowInput, i) => {
            var cellPropName = rowInput.options.ModelName;
            record[cellPropName] = rowInput;
        });
        return record;
    }

    get rowIndex() {
        var rowIndex = this.getProp('data-rowindex');
        return parseInt(rowIndex);
    }

    set rowIndex(index: number) {
        this.prop('data-rowindex', index);
    }

    /**
     * This function returns an object which contains the values of the all the inputs in the row
     * @returns Retuns an object which contains the values of the inputs
     */
    getRowData(): any {
        var rowInputs = this.getInputs();
        var record = {};
        var rowCat = this.rowCategory;
        record['rowCategory'] = rowCat;

        rowInputs.forEach((rowInput, i) => {
            var cellPropName = rowInput.options.ModelName;
            record[cellPropName] = rowInput.val;
        });
        record["clientRowNumber"] = this.rowIndex;
        // console.log('GetRowData: ', record);
        return record;
    }

    get isRowDirty(): boolean {
        return this.getProp('data-isdirty') === 'true';
    }

    set isRowDirty(val: boolean) {
        this.prop('data-isdirty', val === true ? "true" : 'false');
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


}
