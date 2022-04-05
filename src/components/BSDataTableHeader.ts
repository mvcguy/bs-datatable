import { BSDataTableRowCollection } from "./BSDataTableRowCollection";

export class BSDataTableHeader extends BSDataTableRowCollection {


    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = document.createElement('thead');
        this.addClass('table-light')
    }
}
