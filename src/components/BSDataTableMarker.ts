import { BSDataTableBase } from "./BSDataTableBase";

export class BSDataTableMarker extends BSDataTableBase {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.element = document.createElement('i');
        this.element.classList.add('bi', 'bi-caret-right', 'row-marker')
    }

    clone() {
        return super.clone();
    }
}
