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

        var currentPage = this.options.metaData.pageIndex ?? 1;

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
            if (currentPage === index) {
                li.classList.add('active');
            }

            var link = new BSDataTableHyperLink({
                dataSourceName: this.options.dataSourceName,
                classes: 'page-link',
                href: '#',
                text: `${index}`,
                clickHandler: (e) => {
                    e.preventDefault();
                    if (e.target instanceof HTMLElement) {
                        if (this.options.nextPageCallback) {
                            var index = e.target.getAttribute('data-p-index');
                            this.options.nextPageCallback(parseInt(index));
                            this.focusPageIndex(index);
                        }
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

    focusPageIndex(index: any) {
        this.pageLinks.forEach((x) => {
            var li = x.element.closest('.page-item');
            if (!li) return;

            if (x.getProp('data-p-index') === index) {
                if (li.classList.contains('active') !== true)
                    li.classList.add('active');
            }
            else {
                li.classList.remove('active');
            }
        });
    }

    clear() {
        var list = this.element.querySelector('#' + this.listId);
        this.pageLinks = [];

        // remove all the children of the list
        // ref: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
        list.replaceChildren();
    }
}
