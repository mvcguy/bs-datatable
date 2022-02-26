import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableSelectorWindow } from "./BSDataTableSelectorWindow";

export class BSDataTableSelectorWindowCollection extends BSDataTableBase {

    /**@type BSDataTableSelectorWindow[] */
    items: BSDataTableSelectorWindow[];

    constructor() {
        super();
        this.items = [];
    }

    /**
     * @param {BSDataTableSelectorWindow} item
     */
    add(item: BSDataTableSelectorWindow) {
        if (!this.find(item.options.propName))
            this.items.push(item);
    }

    /**
     * @param {string} propName
     * @returns {BSDataTableSelectorWindow} Item that mataches the propName
     */
    findSelector(propName: string): BSDataTableSelectorWindow {
        return this.items.find((item) => item.options.propName === propName);
    }
}
