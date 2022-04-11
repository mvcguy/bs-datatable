import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableActions extends BSDataTableBase {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = document.createElement('div');
        this.element.classList.add('row', 'actions-container');
    }

    addAction(id: string, type: string, icon: string, callback: (e: MouseEvent) => any) {
        var btn = this.getButton(id, type, icon);
        btn.addEventListener('click', callback);
        this.element.appendChild(btn);
        return this;
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addDeleteAction(callback: (arg0: MouseEvent) => any) {

        return this.addAction('btnDeleteRow', 'danger', 'trash', callback);
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addNewRecordAction(callback: (arg0: MouseEvent) => any) {
        
        return this.addAction('btnAddRow', 'primary', 'plus-circle', callback);
    }

    addGridSettingsAction() {
       
        var btn = this.getButton('btnSettings', 'primary', 'gear');
        btn.setAttribute('data-bs-toggle', 'modal');
        btn.setAttribute('data-bs-target', `#staticBackdrop_${this.dataSourceName}`);
        this.element.append(btn);
        return this;
    }

    getButton(id: string, type: string, icon: string) {
        var btn = document.createElement('button');
        btn.type = "button";
        btn.classList.add('btn', 'btn-sm', `btn-outline-${type}`, 'grid-toolbar-action');
        btn.id = `${id}_${this.dataSourceName}`;

        this.appendIcon(btn, icon);
        return btn;
    }

    getIcon(iconType: string): HTMLElement {
        var icon = document.createElement('i');
        icon.classList.add('bi', `bi-${iconType}`);
        return icon;
    }

    appendIcon(elem: HTMLElement, iconType: string) {
        var icon = this.getIcon(iconType);
        elem.append(icon);
    }
}
