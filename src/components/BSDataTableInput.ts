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
            this.element = this.jquery("<select></select>");
        if (this.options.InputType === 'button')
            this.element = this.jquery(`<button class="btn btn-outline-primary" type="button"></button>`);
        else
            this.element = this.jquery(`<input type='${this.options.InputType}' /> `);
    }

    get val(): string | number | string[] {
        if (this.options.InputType === 'date' && this.element.val())
            return new Date(this.element.val().toString()).toString();

        return this.element.val();
    }

    set val(v: string | number | string[]) {
        this.element.val(v);
    }

    /**
     * This method should be used with dropdowns where just setting the val of element is not enough
     * this method ensure that 'change' is called after 'val' so that value of the selector is set properly
     * @param {string} v - value
     */
    set valExt(v) {
        this.element.val(v);
        this.element.change();
    }

    get modelName() {
        return this.getProp('data-propname');
    }

    set modelName(v) {
        this.prop('data-propname', v);
    }

    get readonly() {
        return this.element.is("readonly");
    }

    set readonly(v) {
        var val = v === true ? "true" : "false";
        this.element.attr('readonly', val);
    }

    get disabled(): boolean {
        return this.element.is("disabled");
    }

    set disabled(v: boolean) {
        var val = v === true ? "true" : "false";
        this.element.attr('disabled', val);
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
        this.element.on('dblclick', (e) => {
            this.notifyListeners(this.appDataEvents.ON_ROW_DOUBLE_CLICKED, { EventData: { Event: e }, DataSourceName: this.options.DataSourceName });
        })
    }

    change() {
        this.element.change();
    }
}

export { BSDataTableInput }