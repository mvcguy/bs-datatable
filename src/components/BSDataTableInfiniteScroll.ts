import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTablePagingMetaData } from "../commonTypes/common-types";
import { BSDataTableHttpClient } from "./BSDataTableHttpClient";

export class BSDataTableInfiniteScroll extends BSDataTableBase {

    /**
     * @type {BSDataTablePagingMetaData} metadata
     */
    initMetaData: BSDataTablePagingMetaData;

    /**
     * @type {number}
     */
    currentPage: number;

    initData: object[];
    gridElement: JQuery;
    httpClient: BSDataTableHttpClient;
    s_area: string;
    observer: IntersectionObserver;
    target: HTMLElement;
    nextPageCallback: (page: number) => void;

    /**
     * @param {{ gridElement: any; httpClient: BSDataTableHttpClient }} options
     */
    constructor(options: { gridElement: JQuery; httpClient: BSDataTableHttpClient; }) {
        super();
        this.gridElement = options.gridElement;
        this.httpClient = options.httpClient;

        this.s_area = null;
        this.observer = null;
        this.target = null;

        // this.totalPages = null;
        this.currentPage = 1;
        this.initData = null;
        this.initMetaData = null;
        this.nextPageCallback = null;

    }

    /**
     * @param {IntersectionObserverEntry[]} entries
     * @param {IntersectionObserver} sender
     */
    observerCB(entries: IntersectionObserverEntry[], sender: IntersectionObserver) {
        var entry = entries[0];
        // console.log(entry);
        if (entry.isIntersecting === true) {
            // console.log('Observer is invoked. Entry: ', entry);
            // console.log('initdata: ', this.initData);
            // console.log('metadata: ', this.initMetaData);
            //
            // fetch next page if we still have more pages to read
            //
            if (this.currentPage < this.initMetaData.totalPages) {
                console.log('Infinite scroll: fetching next page#: ', this.currentPage + 1);
                this.currentPage++;
                this.nextPageCallback(this.currentPage);
            }
        }
    }

    observe(el: HTMLElement) {
        this.target = el;
        this.observer.observe(el);
    }

    unobserve() {
        this.observer.unobserve(this.target);
    }

    enable() {
        this.s_area = 'scroll_area_' + this.gridElement.attr('id');
        var scrollArea = this.jquery(`<div class="row bs-scroll" id="${this.s_area}" style="max-height: 200px; overflow-y: auto"></div>`);
        this.gridElement.wrap(scrollArea);

        // var root = this.jquery.find(`#${this.s_area}`);
        let options = {
            // root: root[0],
            root: this.jquery(`#${this.s_area}`)[0],
            rootMargin: '0px',
            threshold: 0.3,
            trackVisibility: false
        };

        this.observer = new IntersectionObserver((entries, sender) => this.observerCB(entries, sender), options);

        var rows = this.gridElement.find('tr');
        var lastRow = rows[rows.length - 1];
        var target = lastRow;
        // console.log(target, root);
        this.observe(target);
    }
}
