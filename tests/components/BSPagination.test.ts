import { BSDataTablePaginationOptions, BSDataTablePagingMetaData } from "src";
import { BSDataTablePagination } from "../../src/components"

describe('Verify props of the pagination component', function () {
    var paginator = new BSDataTablePagination({
        dataSourceName: 'ds',
        metaData: new BSDataTablePagingMetaData(1, 10, 100),
        nextPageCallback: page => {
            
        }
    });
})