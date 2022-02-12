import { CacheService, BSGridBase } from "./index";

export class BSDataTable extends BSGridBase{
    cache: CacheService;
    constructor() {
        super();
        this.cache = new CacheService();

    }

    render() {
        console.log('The render function will be called manually by the developer');
    }
}