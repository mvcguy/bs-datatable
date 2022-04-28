# bs-datatable
A data table based on bootstrap 5.

Note: The dependency from jquery has been removed from version 1.1.0

I have prepared a demo application here on github to demonstrate how to use the datatable in your project. Please have a look here.

https://github.com/mvcguy/bs-datatable-testapp.git

# Features
<li class="list-group-item">Very simple to setup, use this example as a guide <a href="https://github.com/mvcguy/bs-datatable-testapp.git">Here</a></li>
      <li class="list-group-item">Supports pagination and inifinite scroll(default)</li>
      <li class="list-group-item">Can be used for in-memory data along with pagination</li>
      <li class="list-group-item">Can be installed via NPM as a package or use the UMD from the dist</li>
      <li class="list-group-item">Support all the html controls</li>
      <li class="list-group-item">The API has methods for getting dirty or all records to send back to server for processing</li>
      
# Installation

NPM:

    npm install bs-datatable
    
# Sample Code:

Typescript

    import { BSFluentBuilder, BSDataTablePagingMetaData } from "bs-datatable"

    export class StaticDemo {

    static run() {
        //
        // sample using bootstrap data grid 
        //

        var tableBuilder = BSFluentBuilder.CreateBuilder()
            .SetDataSourceName('Customers')
            .SetId('grid')
            .SetContainerId('customers_container')
            .IsReadonly(false)
            .IsRemote(false)
            .EnableInfiniteScroll(true)
            .CacheResponses(false);

        // Add columns
        var totCols = 5, totRows = 60;
        for (let i = 0; i < totCols; i++) {
            tableBuilder.AddColumn(col => {
                col.DisplayName = "COL-" + i;
                col.PropName = "col-" + i;
                col.Width = "180px";
                col.DataType = "text";
            });
        }

        // Add some initial data
        tableBuilder.AddInitData(config => {
            for (let i = 0; i < totRows; i++) {

                var record = {};
                for (let j = 0; j < totCols; j++) {
                    record['col-' + j] = 'DATA-' + i + '-' + j;
                }
                config.initData.push(record);
            }
            config.metaData = new BSDataTablePagingMetaData(1, 10, totRows);
        })

        // render data table
        var table = tableBuilder
            .Build()
            .RegisterCallbacks()
            .Render();

        // customize grid actions
        table.gridActions.addAction('btnSave', 'primary', 'save', (e) => {
            console.log('save button is called');
            var records = table.allRecords;
            console.log('All records:')
            console.table(records);

            console.log('Dirty rows:');
            console.table(table.dirtyRecords);
        });

    }
}

# Sample App:

![image](https://user-images.githubusercontent.com/12786083/163065164-16f20151-3bbf-4358-a81a-b09f59d9befa.png)


