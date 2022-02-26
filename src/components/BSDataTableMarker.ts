import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableMarker extends BSDataTableBase {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = this.jquery(`<i class="bi bi-caret-right row-marker"></i>`);
    }

    clone() {
        return super.clone();
    }
}
