import { BSTableBase } from "./index";
import { BSTextInputExt } from "./index";


export class BSDataTable extends BSTableBase {
    Welcome: BSTextInputExt;
    constructor() {
        super();
        
        this.Welcome = new BSTextInputExt({ inputType: "text", elementId: "txtWelcome", dataSourceName: "welcome" });

    }

    render() {
        console.log('The render function will be called manually by the developer');
    }
}