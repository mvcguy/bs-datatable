import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableButton } from "./BSDataTableButton";

export class BSDataTableActions extends BSDataTableBase {

    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = document.createElement('div');
        this.addClass('row actions-container');
    }

    addAction(id: string, type: string, icon: string, callback: (e: MouseEvent) => any, name: string = '') {
        var btn = this.getButton(id, type, icon, name);
        btn.addClickHandler(callback);
        this.append(btn, true);
        return this;
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addDeleteAction(callback: (arg0: MouseEvent) => any) {
        return this.addAction('btnDeleteRow', 'danger', 'trash', callback, 'Delete');
    }

    /**
     * @param {(arg0: object) => any} [callback]
     */
    addNewRecordAction(callback: (arg0: MouseEvent) => any) {
        return this.addAction('btnAddRow', 'primary', 'plus-circle', callback, 'Add');
    }

    addGridSettingsAction() {
        var btn = this.getButton('btnSettings', 'primary', 'gear', 'Settings');
        btn.prop('data-bs-toggle', 'modal');
        btn.prop('data-bs-target', `#staticBackdrop_${this.dataSourceName}`);
        this.append(btn, true);
        return this;
    }

    getButton(id: string, type: string, icon: string, name: string) {

        var btn = new BSDataTableButton({
            DataSourceName: this.dataSourceName,
            Classes: `btn btn-sm btn-outline-${type} grid-toolbar-action`,
            ElementId: `${id}_${this.dataSourceName}`,
            Icon: icon,
            Title: name
        });

        return btn;
    }
}
