import { BSDataTableColDefinition, BSInputOptions, BSSelectOptions, BSSelectorOptions } from "../commonTypes/common-types";
import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableCheckBox } from "./BSDataTableCheckBox";
import { BSDataTableInput } from "./BSDataTableInput";
import { BSDataTableSelect } from "./BSDataTableSelect";
import { BSDataTableSelector } from "./BSDataTableSelector";
import { BSDataTableTextInput } from "./BSDataTableTextInput";

export class BSDataTableCell extends BSDataTableBase {


    /**
     * @type {boolean}
     */
    isHeader: boolean;
    options: BSDataTableColDefinition;
    /**
     * @param {BSDataTableColDefinition} [options]
     */
    constructor(options?: BSDataTableColDefinition, isHeader = false) {
        super();
        this.options = options || {};
        this.isHeader = isHeader;
        this.render();
    }

    render() {
        var rowSpan = this.options ? this.options.RowSpan : undefined;
        var colSpan = this.options ? this.options.ColSpan : undefined;

        this.element =
            this.isHeader === true
                ? document.createElement('th')
                : document.createElement('td')

        if (this.isHeader) {
            this.element.classList.add('sorting', 'ds-col');

            if (this.options.DisplayName) {
                this.setText(this.options.DisplayName);
            }
        }

        if (rowSpan)
            this.prop('rowSpan', rowSpan);

        if (colSpan)
            this.prop('colSpan', colSpan);

        // add control 
        this.addInputControl();
    }

    addInputControl() {
        var model = this.options;
        if (this.isHeader || !model.DisplayName || !model.PropName) return;

        var ds = model.DataSourceName;

        var input = null;
        var inputOptions: BSInputOptions = {
            DataSourceName: ds,
            ModelName: model.PropName,
            PlaceHolder: model.DisplayName,
            Title: model.DisplayName,
            InputType: model.DataType,            
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

            inputOptions.InputType = 'text';
            var sltrOptions: BSSelectorOptions = {
                ...inputOptions,
                ContainerId: model.ContainerId,
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

        if (model.IsReadOnly === true) {
            input.readonly = true;
            input.setCss('cursor', 'pointer');
            input.setCss('user-select', 'none');
        }

        //
        // TODO: add a common class to the input elements
        //

        this.append(input);
    }

    getInputControls(): BSDataTableInput[] {
        //
        // ideally there should be only input control linked to a table cell!!!
        //

        if (this.isHeader === true) return [];

        var inputs: BSDataTableInput[] = [];

        var children = this.children;
        if (children.length > 0) {
            children.forEach((v, i) => {
                if (v instanceof BSDataTableSelector)
                    inputs.push(v.txtElement);
                else if (v instanceof BSDataTableInput)
                    inputs.push(v);
            });
        }
        return inputs;
    }

    getCellText(): string | number | boolean | string[] {

        if (this.isHeader) return this.getText();

        var child = this.children[0];
        if (!child) return "";

        if (child.element instanceof HTMLInputElement) {
            if (child instanceof BSDataTableCheckBox) {
                return child.element.checked + "";
            }
            else if (child instanceof BSDataTableInput) {
                return child.val;
            }
        }

        return child.getText();


    }

    clone() {
        // debugger;
        var sc = super.clone();
        var c = new BSDataTableCell(this.shClone(this.options), this.isHeader);
        var txt = c.getText();
        c.children = sc.children;
        c.element = sc.element;
        if (this.isHeader) {
            c.setText(txt);
        }
        return c;
    }
}
