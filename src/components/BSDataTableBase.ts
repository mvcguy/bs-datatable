import { dataEventsService } from "../services";
import { BSEvent } from "../commonTypes/common-types";


class BSDataTableBase {

    element: HTMLElement;
    children: BSDataTableBase[];

    constructor() {
        this.children = [];
    }

    /**
     * Add handler to the events raised by the DOM
     */
    addEventHandler(eventName: string, handler: EventListener) {

        this.element.addEventListener(eventName, handler);
    }

    set title(val: string) {
        this.element.title = val;
    }

    get title(): string {
        return this.element.title;
    }

    _dataSourceName: string;

    get dataSourceName(): string {
        return this._dataSourceName;
    }

    set dataSourceName(v: string) {
        this._dataSourceName = v;
    }

    _isReadOnly: boolean;
    get isReadOnly(): boolean {
        return this._isReadOnly;
    }

    set isReadOnly(v: boolean) {
        this._isReadOnly = v;
    }

    get width() {
        return this.element.style.width;
    }
    set width(width) {
        this.element.style.width = width;
    }

    get visible() {
        //return !!(this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length);
        return this.element.hidden !== true;
    }
    set visible(val) {
        //this.element.style.display = val === false ? "none" : "block";
        this.element.hidden = val !== true;

    }

    getCss(t: string) {
        return this.element.style[t];
    }

    setCss(k: string, v: any) {

        this.element.style[k] = v;
    }

    set css(css) {
        if (typeof css === 'object' && css !== null && this.isEmptyObj(css) !== true) {
            var keys = Object.keys(css);
            keys.forEach((k) => {
                this.element.style[k] = css[k];
            });
        }
    }

    /**
     * 
     * @param {object[]} props 
     */
    props(props) {
        var _this = this;
        props.forEach((p) => _this.prop(p.key, p.value))
    }

    /**
     * Sets the value of an attribute
     * @param key 
     * @param value 
     * @returns 
     */
    prop(key: string, value) {
        // return this.element.attr(key, value);
        this.element.setAttribute(key, value);
        return this.element;
    }

    getProp(key: string) {
        return this.element.getAttribute(key);
    }

    // find(selector: string) {
    //     return this.element.querySelectorAll(selector);
    // }

    findElements(selector: string) {
        return this.element.querySelectorAll(selector);
    }

    findById(id: string) {
        return document.getElementById(id);
    }

    removeElement(el: Element) {
        var parent = el.parentElement;
        parent.removeChild(el);
    }

    addClass(cssClass: string) {
        var split = cssClass.split(' ');

        this.element.classList.add(...split);
        return this;
    }

    removeClass(cssClass: string) {
        this.element.classList.remove(cssClass);
        return this;
    }

    hasClass(cssClass: string) {
        return this.element.classList.contains(cssClass);
    }

    hasClasses(cssClasses: string): boolean {
        return cssClasses.split(' ')
            .find((x) => this.element.classList.contains(x) === false) === undefined;
    }

    setText(txt: string) {
        this.element.textContent = txt;
        return this;
    }

    getText() {
        return this.element.textContent;
    }

    /**
     * 
     * @param {BSDataTableBase} elem 
     */
    append(elem: BSDataTableBase, pushToChildrenArray = true) {

        if (pushToChildrenArray) {
            this.children.push(elem);
        }

        this.element.appendChild(elem.element);
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
        var x = this.element.cloneNode();
        if (x instanceof HTMLElement) {
            c.element = x;
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

    childrenNodes() {
        return this.element.children;
    }

    appendChild(node: Node) {
        this.element.appendChild(node);
    }

    wrap(wrapper: Element, nodes: HTMLCollection | Element) {


        var clone = wrapper.cloneNode();

        if (nodes instanceof Element) {
            var parent = nodes.parentElement;
            clone.appendChild(nodes);
            parent.appendChild(clone);
        }
        else {
            if (nodes.length <= 0) return;
            var parent = nodes[0].parentElement;

            for (let index = 0; index < nodes.length; index++) {
                const element = nodes[index];
                clone.appendChild(element);
            }

            parent.appendChild(clone);
        }
    }

    addDragHandlers(node: Element, dragHandlers: {
        dragStart: (ev: DragEvent) => any;
        dragLeave: (ev: DragEvent) => any;
        dragEnter: (ev: DragEvent) => any;
        dragOver: (ev: DragEvent) => any;
        dragEnd: (ev: DragEvent) => any;
        drop: (ev: DragEvent) => any;

    }) {
        if (!dragHandlers || this.isEmptyObj(dragHandlers)) return;

        if (dragHandlers.dragStart) {
            node.addEventListener('dragstart', dragHandlers.dragStart);
        }

        if (dragHandlers.dragLeave) {
            node.addEventListener('dragleave', dragHandlers.dragLeave);
        }

        if (dragHandlers.dragEnter) {
            node.addEventListener('dragenter', dragHandlers.dragEnter);
        }

        if (dragHandlers.dragOver) {
            node.addEventListener('dragover', dragHandlers.dragOver);
        }

        if (dragHandlers.dragEnd) {
            node.addEventListener('dragend', dragHandlers.dragEnd);
        }

        if (dragHandlers.drop) {
            node.addEventListener('drop', dragHandlers.drop);
        }

    }

    matches(elem: Element, filter: string) {
        if (elem && elem.nodeType === 1) {
            if (filter) {
                return elem.matches(filter);
            }
            return true;
        }
        return false;
    }

    siblings(selector: string): Element[] {
        var list = [];
        if (!this.element.parentNode) return list;
        this.element.parentNode.childNodes.forEach((nd) => {
            if (nd === this.element) return;

            if (this.matches(nd as HTMLElement, selector)) {
                list.push(nd);
            }
        });

        return list;

    }



}

export { BSDataTableBase }