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

        // this.element =
        //     this.jquery(
        //         `<div class="bs-pagination" id="${this.containerId}">
        //                 <nav aria-label="Page navigation">

        //                 </nav>
        //             </div>`);

        this.element = document.createElement('div');
        this.element.id = this.containerId;
        this.addClass('bs-pagination');

        var pager = document.createElement('nav');
        pager.setAttribute('aria-labale', "Page navigation");

        this.element.appendChild(pager);

        // var pageList = this.jquery(`<ul class="pagination justify-content-end" id="${this.listId}"></ul>`);
        var pageList = document.createElement('ul');
        pageList.id = this.listId;
        pageList.classList.add('pagination', 'justify-content-end');


        for (let index = 1; index <= this.options.pagingMetaData.totalPages && index <= 5; index++) {
            // var li = this.jquery('<li class="page-item"></li>');
            var li = document.createElement('li');
            li.classList.add('page-item');

            // var link = this.jquery(`<a class="page-link" href="#" data-p-index="${index}">${index}</a>`);
            var link = document.createElement('a');
            link.classList.add('page-link');
            link.href = '#';
            link.classList.add('data-p-index');
            link.innerText = `${index}`;

            li.appendChild(link);
            pageList.appendChild(li);


            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target instanceof HTMLElement) {
                    var index = e.target.getAttribute('data-p-index');

                    if (this.options.nextPageCallback)
                        this.options.nextPageCallback(parseInt(index));
                }

            });
        };

        pager.appendChild(pageList);
    }

    clear() {
        var list = this.element.querySelector('#' + this.listId);
        
        // remove all the children of the list
        // ref: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
        list.replaceChildren();
    }
}
