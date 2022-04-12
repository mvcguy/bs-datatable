import { Modal } from "bootstrap";
import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableDataSource, BSDataTableOptions, BSSelectorWindowOptions } from "../commonTypes/common-types";
import { BSDataTable } from "./BSDataTable";


export class BSDataTableSelectorWindow extends BSDataTableBase {

    selectorModal: Modal;
    grid: BSDataTable;
    options: BSSelectorWindowOptions;
    parentContainerId: string;
    modalId: string;
    modalTitleId: string;
    containerId: string;
    gridId: string;
    onItemSelected: (sender: any, e: any) => void;
    onWindowShown: (sender: BSDataTableSelectorWindow) => void;

    /**
     * @param {{ propName: string; containerId: string; urlCb: getUrlCallback; gridCols: BSDataTableColDefinition[]}} options
     */
    constructor(options: BSSelectorWindowOptions) {
        super();
        this.options = options;
        this.parentContainerId = this.options.ContainerId;
        this.modalId = `${this.parentContainerId}_bs_${this.options.PropName}`;
        this.modalTitleId = `${this.parentContainerId}_lbs_${this.options.PropName}`;
        this.containerId = `${this.parentContainerId}_cbs_${this.options.PropName}`;
        this.gridId = `${this.parentContainerId}_g_${this.options.PropName}`;
        this.render();
        this.grid = this.renderGrid();
        this.onItemSelected = (/** @type {BSDataTable} */ sender: BSDataTable, /** @type {any} */ e: any) => { console.log(); };
    }


    render() {

        var modal = document.getElementById(this.modalId);

        if (modal) {
            this.element = modal;
            this.selectorModal = Modal.getOrCreateInstance(modal);            
        }
        else {
            this.element = document.createElement('div');
            this.element.id = this.modalId;
            this.element.classList.add('modal');

            this.element.innerHTML = `<div class="modal-dialog modal-dialog-scrollable">
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
                                </div>`;

            var parentContainer = document.getElementById(this.parentContainerId);
            if (parentContainer) {
                parentContainer.appendChild(this.element);
            }

            this.selectorModal = new Modal(this.element);

            this.element.addEventListener('shown.bs.modal', (e) => {
                this.grid.clearGrid();
                this.grid.infiniteScroller.currentPage = 1;
                this.grid.fetchGridPage(1);
                this.onWindowShown(this);
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
        var dataSource = new BSDataTableDataSource(this.options.DataSourceName,
            {
                initData: [],
                metaData: undefined
            },
            true,
            this.options.UrlCb
        );

        var bs = new BSDataTableOptions(this.gridId, this.containerId, this.options.GridCols, dataSource, true);
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
