import { BSDataTableBase } from "./BSDataTableBase";
import { BSInputOptions } from "../commonTypes/common-types";

class BSDataTableInput extends BSDataTableBase {
    options: BSInputOptions

    constructor(options: BSInputOptions) {
        super();
        this.options = options;
    }

    render() {
        if (this.options.InputType === 'select')
            this.element = document.createElement('select');

        else if (this.options.InputType === 'button') {
            this.element = document.createElement('button');
            this.element.classList.add('btn', 'btn-outline-primary');
        }
        else {
            this.element = document.createElement('input');
            this.element['type'] = this.options.InputType;
        }
    }

    get val(): boolean | string | number | string[] {

        if (!this.element) return undefined;

        if (this.element instanceof HTMLInputElement) {
            if (this.options.InputType === 'checkbox')
                return this.element.checked;
            else if (this.options.InputType === 'number')
                return this.element.valueAsNumber;
            else return this.element.value;
        }

        return this.element['value'];
    }

    set val(v: boolean | string | number | string[]) {

        if (!this.element) return;

        if (this.options.InputType === 'checkbox')
            this.element['checked'] = v;
        else
            this.element['value'] = v;

        // invoke change event if its a select input
        if (this.options.InputType === 'select') {
            this.change();
        }
    }

    /**
     * This method should be used with dropdowns where just setting the val of element is not enough
     * this method ensure that 'change' is called after 'val' so that value of the selector is set properly
     * @param {string} v - value
     */
    set valExt(v: string | number | string[]) {
        this.val = v;
        this.change();
    }

    get modelName() {
        return this.getProp('data-propname');
    }

    set modelName(v) {
        this.prop('data-propname', v);
    }

    get readonly() {
        if (this.element instanceof HTMLInputElement)
            return this.element.readOnly;

        return false;
    }

    set readonly(v) {
        if (this.element instanceof HTMLInputElement) {
            this.element.readOnly = v;
        }

    }

    get disabled(): boolean {
        if (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement) {
            return this.element.disabled;
        }

        var val = this.getProp('disabled') === 'true' ? true : false;
        return val;

    }

    set disabled(v: boolean) {

        if (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement) {
            this.element.disabled = v;
            return;
        }

        var val = v === true ? "true" : "false";
        this.prop('disabled', val);
    }

    get isKey() {
        return this.getProp('data-keycolumn') === 'true';
    }


    set isKey(v) {
        this.prop('data-keycolumn', v);
    }

    clone() {
        return super.clone();
    }

    addDoubleClickEvent() {
        this.element.addEventListener('dblclick', (e) => {
            this.notifyListeners(this.appDataEvents.ON_ROW_DOUBLE_CLICKED, { EventData: { Event: e }, DataSourceName: this.options.DataSourceName });
        })
    }

    change() {
        this.element.dispatchEvent(new Event('change'));
    }

}

export { BSDataTableInput }