import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableCell } from "./BSDataTableCell";
import { BSDataTableColDefinition, BSRowOptions} from "../commonTypes/common-types";
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
    
    render() {
        if (!this.element)
            this.element = document.createElement('tr');

        if (this.options.gridHeader === true) {
            this.addClass('draggable')
                .addClass('grid-cols')
        }
        else {
            this.addClass('grid-row');
        }

        if (this.options.isTemplateRow === true) {

            this.css = { 'display': 'none' };
            this.visible = false;
        }
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

    focusRow() {
        this.removeClass('table-active')
            .addClass('table-active');
    }

    getInputs(): BSDataTableInput[] {

        if (this.options.gridHeader === true) return [];

        var inputs: BSDataTableInput[] = [];

        this.cells.forEach((cell, idx) => {
            var controls = cell.getInputControls();
            inputs = inputs.concat(controls);
        });
        return inputs;
    }

    createInputFor(model: BSDataTableColDefinition, readonly: boolean): BSDataTableCell {        
        // TODO: The arg readonly is not needed!!!
        model.DataSourceName = this.dataSourceName;
        model.IsReadOnly = readonly;
        model.ContainerId = this.options.containerId;
        return new BSDataTableCell(model, false);
    }

    /**
     * @param {BSDataTableColDefinition} model
     */
    createHeaderFor(model: BSDataTableColDefinition) {
        return new BSDataTableCell(model, true);
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
