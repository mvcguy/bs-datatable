import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTablePaginationOptions } from "../commonTypes/common-types";

export class BSDataTablePagination extends BSDataTableBase {
    options: BSDataTablePaginationOptions;
    listId: string;
    containerId: string;

    /**
     * @param {BSDataTablePaginationOptions} options
     */
    constructor(options: BSDataTablePaginationOptions) {
        super();
        this.options = options;
        this.listId = `pg_list_${this.options.dsName}`;
        this.containerId = `pg_container_${this.options.dsName}`;
    }

    render() {
        if (this.element)
            this.element.remove();

        this.element =
            this.jquery(
                `<div class="bs-pagination" id="${this.containerId}">
                        <nav aria-label="Page navigation">
                            
                        </nav>
                    </div>`);
        var pageList = this.jquery(`<ul class="pagination justify-content-end" id="${this.listId}"></ul>`);

        for (let index = 1; index <= this.options.pagingMetaData.totalPages && index <= 5; index++) {
            var li = this.jquery('<li class="page-item"></li>');
            var link = this.jquery(`<a class="page-link" href="#" data-p-index="${index}">${index}</a>`);
            li.append(link);
            pageList.append(li);

            link.on('click', (e) => {
                e.preventDefault();
                var index = this.jquery(e.target).attr('data-p-index');

                if (this.options.nextPageCallback)
                    this.options.nextPageCallback(parseInt(index));
            });
        };

        this.element.find('nav').append(pageList);
    }

    clear() {
        this.jquery('#' + this.listId).children('li').remove();
    }
}
