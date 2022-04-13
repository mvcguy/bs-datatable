import { BSDataTableInput } from "./BSDataTableInput";
import { BSSelectorOptions } from "../commonTypes/common-types";
import { BSDataTableTextInput } from "./BSDataTableTextInput";
import { BSDataTableButton } from "./BSDataTableButton";
import { BSDataTableSelectorWindow } from "./BSDataTableSelectorWindow";

export class BSDataTableSelector extends BSDataTableInput {

    options: BSSelectorOptions;
    /**
     * @type {BSDataTableButton}
     */
    btnElement: BSDataTableButton;

    /**
     * @type {BSDataTableTextInput}
     */
    txtElement: BSDataTableTextInput;

    constructor(options: BSSelectorOptions) {
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

        this.txtElement = new BSDataTableTextInput(this.options.DataSourceName);
        this.txtElement
            .addClass(this.options.CssClass)
            .props([{ key: "id", value: this.options.ElementId },
            { key: "placeHolder", value: this.options.PlaceHolder },
            { key: "data-propname", value: this.options.PropName }]);

        this.btnElement = new BSDataTableButton({
            DataSourceName: this.options.DataSourceName,
            Icon: 'search',
            Handler: (e) => this.options.BtnClick(this, e)
        });

        var wrapper = document.createElement('div');
        wrapper.classList.add('input-group', 'input-group-sm');
        wrapper.appendChild(this.txtElement.element);
        wrapper.appendChild(this.btnElement.element);

        this.element = wrapper;
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
