import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableActions extends BSDataTableBase {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery('<div class="row actions-container"></div>');
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addDeleteAction(callback: (arg0: object) => any) {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-danger grid-toolbar-action" 
                                    id="btnDeleteRow_${this.dataSourceName}"><i class="bi bi-trash"></i>
                                </button>`);
        btn.on('click', callback);
        this.element.append(btn);
        return this;
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addNewRecordAction(callback: (arg0: object) => any) {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
                                    id="btnAddRow_${this.dataSourceName}"><i class="bi bi-plus-circle"></i>
                                </button>'`);
        btn.on('click', callback);
        this.element.append(btn);
        return this;
    }

    addGridSettingsAction() {
        var btn = this.jquery(`<button type="button" class="btn btn-sm btn-outline-primary grid-toolbar-action" 
                                    data-bs-toggle="modal" data-bs-target="#staticBackdrop_${this.dataSourceName}" 
                                    id="btnSettings_${this.dataSourceName}"><i class="bi bi-gear"></i>
                                </button>`);
        this.element.append(btn);
        return this;
    }
}
