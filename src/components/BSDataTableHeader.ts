import { BSDataTableRowCollection } from "./BSDataTableRowCollection";

export class BSDataTableHeader extends BSDataTableRowCollection {


    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery('<thead class="table-light"></thead>');
    }
}
