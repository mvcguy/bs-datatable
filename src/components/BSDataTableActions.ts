import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableActions extends BSDataTableBase {

    constructor() {
        super();
        this.render();
    }

    render() {
        //this.element = this.jquery('<div class="row actions-container"></div>');
        this.element = document.createElement('div');
        this.element.classList.add('row', 'actions-container');
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addDeleteAction(callback: (arg0: MouseEvent) => any) {
        // var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-danger grid-toolbar-action"
        //                             id="btnDeleteRow_${this.dataSourceName}"><i class="bi bi-trash"></i>
        //                         </button>`);

        var btn = this.getButton('btnDeleteRow', 'danger', 'trash');
        btn.addEventListener('click', callback);
        this.element.appendChild(btn);
        return this;
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addNewRecordAction(callback: (arg0: MouseEvent) => any) {
        // var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
        //                             id="btnAddRow_${this.dataSourceName}"><i class="bi bi-plus-circle"></i>
        //                         </button>'`);
        
        var btn = this.getButton('btnAddRow', 'primary', 'plus-circle');
        btn.addEventListener('click', callback);
        this.element.append(btn);
        return this;
    }

    addGridSettingsAction() {
        // var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
        //                             data-bs-toggle="modal" data-bs-target="#staticBackdrop_${this.dataSourceName}" 
        //                             id="btnSettings_${this.dataSourceName}"><i class="bi bi-gear"></i>
        //                         </button>`);
        
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
