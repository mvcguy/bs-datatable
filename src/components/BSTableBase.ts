import { CookieHelper } from "../services/CookieHelper";
import * as $ from "jquery"
import { dataEventsService } from "../services/data-events-service"
import { appDataEvents, appActions } from "../services/data-events"

export class BSTableBase {


    element: JQuery;

    children: BSTableBase[];
    CookieHelper: typeof CookieHelper;
    jquery: JQueryStatic;
    appDataEvents: typeof appDataEvents;
    appActions: typeof appActions;


    constructor() {

        this.jquery = $;
        this.CookieHelper = CookieHelper;        
        this.children = [];
        this.appDataEvents = appDataEvents;
        this.appActions = appActions;
    }

    notifyListeners(eventType, payload) {
        dataEventsService.notifyListeners(eventType, payload);
    }

    getGridSettings(gridId) {
        try {
            // debugger;
            var gridSettings = this.CookieHelper.getJSON(gridId);
            //console.log('GridSettings Cookie: ', gridSettings ? 'settings found' : 'no settings found!');

            return gridSettings;

        } catch (error) {
            console.log(error);
            return undefined;
        }
    };

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

    getCss(t) {
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
     * @param {BSTableBase} elem 
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
        var c = new BSTableBase();
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