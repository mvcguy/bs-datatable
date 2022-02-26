import { BSDataTableBase } from "../components";

/**
 * Service used to discover data-tables by its identify
 * This can be useful when we have many tables in the page and query them for their data
 * to be sent back to server when the user presses the save/persist button
 */
class BSDataTableDiscoveryService {

    DataTables: BSDataTableBase[] = [];

    Add(datatable: BSDataTableBase) {
        this.DataTables.push(datatable);
    }

    GetAll() {
        var result: BSGridDataModel[] = [];
        this.DataTables.forEach((dt) => {
            if (dt.isReadOnly) return;

            var model: BSGridDataModel = { DataSourceName: dt.dataSourceName, Data: dt.records };
            result.push(model);
        })

        return result;
    }

    /**
     * 
     * @param dsName DataSource Name
     */
    GetByDSName(dsName: string): BSGridDataModel {
        var find = this.DataTables.find((dt) => dt.dataSourceName === dsName);
        if (find)
            return { DataSourceName: find.dataSourceName, Data: find.records }

    }

}

interface BSGridDataModel {
    DataSourceName: string;
    Data: object[]
}

const bsDataTableDiscoveryService = new BSDataTableDiscoveryService();

export { bsDataTableDiscoveryService }