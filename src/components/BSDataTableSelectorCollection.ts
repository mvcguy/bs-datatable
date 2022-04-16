import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTableSelector } from "./BSDataTableSelector";

export class BSDataTableSelectorWindowCollection extends BSDataTableBase {

    items: BSDataTableSelector[];

    constructor() {
        super();
        this.items = [];
    }

    add(item: BSDataTableSelector) {
        if (!this.findItem(item.options.ModelName))
            this.items.push(item);
    }

    findItem(modelName: string): BSDataTableSelector {
        return this.items.find((item) => item.options.ModelName === modelName);
    }
}
