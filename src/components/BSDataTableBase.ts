import * as $ from "jquery"
import { CookieHelper } from "../services/CookieHelper";
import { appActions, appDataEvents } from "../services/data-events";
import { dataEventsService } from "../services/data-events-service";
import { BSEvent } from "../commonTypes/common-types";


class BSDataTableBase {

    element: JQuery;
    children: BSDataTableBase[];
    jquery: JQueryStatic;
    appDataEvents: typeof appDataEvents;
    appActions: typeof appActions;

    constructor() {
        this.jquery = $;
        this.children = [];
        this.appDataEvents = appDataEvents;
        this.appActions = appActions;
    }

    notifyListeners(eventType: string, payload: BSEvent) {
        dataEventsService.Emit(eventType, this, payload);
    }

    getGridSettings(gridId) {
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

    _dataSourceName: string;

    get dataSourceName():string {
        return this._dataSourceName;
    }

    set dataSourceName(v: string) {
        this._dataSourceName = v;
    }

    _isReadOnly: boolean;
    get isReadOnly(): boolean{
        return this._isReadOnly;
    }

    set isReadOnly(v: boolean) {
        this._isReadOnly = v;
    }

    get records(): object[]{
        return [];
    }

    get width() {
        return this.element.css('width');
    }
    set width(width) {
        this.element.css('width', width);
    }

    get visible() {
        return this.element.is(':visible');
    }
    set visible(val) {
        if (val === false)
            this.element.hide()
        else
            this.element.show();
    }

    getCss(t:string) {
        return this.element.css(t);
    }

    setCss(k, v) {
        this.element.css(k, v);
    }

    set css(css) {
        this.element.css(css);
    }

    /**
     * 
     * @param {object[]} props 
     */
    props(props) {
        var _this = this;
        props.forEach((p) => _this.prop(p.key, p.value))
    }

    prop(key: string, value) {
        return this.element.attr(key, value);
    }

    getProp(key: string) {
        return this.element.attr(key);
    }

    find(selector) {
        return this.element.find(selector);
    }

    addClass(cssClass) {
        this.element.addClass(cssClass);
        return this;
    }

    removeClass(cssClass) {
        this.element.removeClass(cssClass);
        return this;
    }

    hasClass(cssClass) {
        return this.element.hasClass(cssClass);
    }

    setText(txt) {
        this.element.text(txt);
        return this;
    }

    getText() {
        return this.element.text();
    }

    /**
     * 
     * @param {BSDataTableBase} elem 
     */
    append(elem, pushToArray = true) {

        if (pushToArray) {
            this.children.push(elem);
        }

        this.element.append(elem.element);
        return this;
    }

    focus() {
        this.element.focus();
    }

    isEmptyObj(obj) {
        return Object.keys(obj).length === 0;
    }

    get id() {
        return this.getProp('id');
    }

    set id(v) {
        this.prop('id', v);
    }

    clone() {
        //debugger;
        var c = new BSDataTableBase();
        // c.element = this.element.clone();
        var x = this.element[0].cloneNode();
        if (x instanceof HTMLElement) {
            c.element = this.jquery(x);
        }


        if (this.children.length > 0) {
            var list = this.children.map((v) => {
                var cc = v.clone();
                c.element.append(cc.element);
                return cc;
            });
            c.children = list;
        }

        return c;
    }

    /**
     * a shallow clone
     * @param {object} obj 
     * @returns 
     */
    shClone(obj) {
        if (!obj) return obj;
        return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
    }
}

export { BSDataTableBase }