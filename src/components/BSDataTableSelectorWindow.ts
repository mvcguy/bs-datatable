import { Modal } from "bootstrap";
import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableColDefinition, getUrlCallback, BSDataTableDataSource, BSDataTableOptions } from "../commonTypes/common-types";
import { BSDataTable } from "./BSDataTable";


export class BSDataTableSelectorWindow extends BSDataTableBase {

    selectorModal: Modal;
    grid: BSDataTable;
    options: { propName: string; containerId: string; urlCb: getUrlCallback; gridCols?: BSDataTableColDefinition[]; };
    parentContainerId: string;
    modalId: string;
    modalTitleId: string;
    containerId: string;
    gridId: string;
    onItemSelected: (sender: any, e: any) => void;

    /**
     * @param {{ propName: string; containerId: string; urlCb: getUrlCallback; gridCols: BSDataTableColDefinition[]}} options
     */
    constructor(options: { propName: string; containerId: string; urlCb: getUrlCallback; gridCols: BSDataTableColDefinition[]; }) {
        super();
        this.options = options;
        this.parentContainerId = this.options.containerId;
        this.modalId = `${this.parentContainerId}_bs_${this.options.propName}`;
        this.modalTitleId = `${this.parentContainerId}_lbs_${this.options.propName}`;
        this.containerId = `${this.parentContainerId}_cbs_${this.options.propName}`;
        this.gridId = `${this.parentContainerId}_g_${this.options.propName}`;
        this.render();
        this.grid = this.renderGrid();
        this.onItemSelected = (/** @type {BSDataTable} */ sender: BSDataTable, /** @type {any} */ e: any) => { console.log(); };
    }


    render() {

        var find = this.jquery('#' + this.parentContainerId).find('#' + this.modalId);
        if (find && find.length === 1) {
            this.element = find;
            this.selectorModal = Modal.getOrCreateInstance(find[0]);
        }
        else {
            var modelTemplate = `<div class="modal" id="${this.modalId}">
                        <div class="modal-dialog modal-dialog-scrollable">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${this.modalTitleId}">Select a value</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div id="${this.containerId}">

                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Ok</button>
                                </div>
                            </div>
                        </div>
                </div>`;

            this.element = this.jquery(modelTemplate);
            this.jquery('#' + this.parentContainerId).append(this.element);

            this.selectorModal = new Modal(this.element[0]);

            this.element[0].addEventListener('shown.bs.modal', (e) => {
                this.grid.clearGrid();
                this.grid.infiniteScroller.currentPage = 1;
                this.grid.fetchGridPage(1);
            });
        }
    }

    show() {
        this.selectorModal.show();
    }

    renderGrid() {
        //
        // grid shown in the selector window
        //
        var dataSource = new BSDataTableDataSource('bsSelector',
            {
                initData: [],
                metaData: undefined
            },
            true,
            this.options.urlCb
        );

        var bs = new BSDataTableOptions(this.gridId, this.containerId, this.options.gridCols, dataSource, true);
        // bs.enableInfiniteScroll = false;
        var grid = new BSDataTable(bs);
        grid.registerCallbacks();

        // grid.addHandler(grid.appDataEvents.ON_ROW_DOUBLE_CLICKED, this.onItemSelected);
        //
        // following events are linked to parent (primary view/form) and are not needed for selector
        //
        grid.removeHandler(this.appDataEvents.GRID_DATA);
        grid.removeHandler(this.appDataEvents.ON_ADD_RECORD);
        grid.removeHandler(this.appDataEvents.ON_FETCH_RECORD);
        grid.removeHandler(this.appDataEvents.ON_SAVE_RECORD);
        grid.removeHandler(this.appDataEvents.ON_SAVE_ERROR);

        grid.render();

        // hide actions
        grid.gridActions.visible = false;
        return grid;
    }
}
