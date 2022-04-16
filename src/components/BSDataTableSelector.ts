import { BSDataTableInput } from "./BSDataTableInput";
import { BSSelectorOptions } from "../commonTypes/common-types";
import { BSDataTableTextInput } from "./BSDataTableTextInput";
import { BSDataTableButton } from "./BSDataTableButton";
import { BSDataTableSelectorWindow } from "./BSDataTableSelectorWindow";
import { appDataEvents } from "../services";

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

    selectorWindow: BSDataTableSelectorWindow;

    constructor(options: BSSelectorOptions, selectorWindow?: BSDataTableSelectorWindow) {
        super(options);
        this.options = options;
        this.selectorWindow = selectorWindow;
        this.render();
    }

    /**
     * @param {BSDataTableSelectorWindow} sender
     * @param {any} e
     */
    onItemSelected(sender: BSDataTableSelectorWindow, e: any) {

        // console.log('row selected', sender.grid.body.getSelectedRow());

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

        if (!this.selectorWindow) {
            var sWindow = new BSDataTableSelectorWindow(this.options);            
            this.selectorWindow = sWindow;
        }

        var btnHandler = (sender: BSDataTableSelector, e) => {
            //
            // show the window, and re-register double-click handler 
            // since the window control is shared by many selectors of same id
            //
            this.selectorWindow.grid.removeHandler(appDataEvents.ON_ROW_DOUBLE_CLICKED);
            this.selectorWindow.grid.addHandler(appDataEvents.ON_ROW_DOUBLE_CLICKED, (s, ev) => sender.onItemSelected(this.selectorWindow, ev));
            this.selectorWindow.show();
        }

        this.txtElement = new BSDataTableTextInput(this.options);
        this.btnElement = new BSDataTableButton({
            DataSourceName: this.options.DataSourceName,
            Icon: 'search',
            Handler: (e) => btnHandler(this, e)
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
        var opt: BSSelectorOptions = this.shClone(this.options);
        opt.cloneContext = true;
        var c = new BSDataTableSelector(opt, this.selectorWindow);
        c.children = sc.children;
        return c;
    }
}
