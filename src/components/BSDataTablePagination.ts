import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTablePaginationOptions } from "../commonTypes/common-types";
import { BSDataTableHyperLink } from "./BSDataTableHyperLink";

export class BSDataTablePagination extends BSDataTableBase {
    options: BSDataTablePaginationOptions;
    listId: string;
    containerId: string;
    pageLinks: BSDataTableHyperLink[] = [];

    /**
     * @param {BSDataTablePaginationOptions} options
     */
    constructor(options: BSDataTablePaginationOptions) {
        super();
        this.options = options;
        this.listId = `pg_list_${this.options.dataSourceName}`;
        this.containerId = `pg_container_${this.options.dataSourceName}`;
    }

    render() {
        if (this.element)
            this.element.remove();
        
        this.pageLinks = [];

        this.element = document.createElement('div');
        this.element.id = this.containerId;
        this.addClass('bs-pagination');

        var pager = document.createElement('nav');
        pager.setAttribute('aria-label', "Page navigation");

        this.element.appendChild(pager);

        var pageList = document.createElement('ul');
        pageList.id = this.listId;
        pageList.classList.add('pagination', 'justify-content-end');

        // TODO: Remove the limit of 5 in the loop below -> index <= 5;
        for (let index = 1; index <= this.options.metaData.totalPages && index <= 5; index++) {
            var li = document.createElement('li');
            li.classList.add('page-item');

            var link = new BSDataTableHyperLink({
                dataSourceName: this.options.dataSourceName,
                classes: 'page-link',
                href: '#',
                text: `${index}`,
                clickHandler: (e) => {
                    e.preventDefault();
                    if (e.target instanceof HTMLElement) {
                        var index = e.target.getAttribute('data-p-index');

                        if (this.options.nextPageCallback)
                            this.options.nextPageCallback(parseInt(index));
                    }

                }
            });
            link.prop('data-p-index', `${index}`);
            this.pageLinks.push(link);
            li.appendChild(link.element);
            pageList.appendChild(li);
        };

        pager.appendChild(pageList);
    }

    clear() {
        var list = this.element.querySelector('#' + this.listId);
        this.pageLinks = [];

        // remove all the children of the list
        // ref: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
        list.replaceChildren();
    }
}
