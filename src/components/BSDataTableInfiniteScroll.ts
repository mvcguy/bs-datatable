import { BSDataTableBase } from "./BSDataTableBase";
import { BSDataTablePagingMetaData, IBSDataTableHttpClient, InfiniteScrollOptions } from "../commonTypes/common-types";

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
    gridElement: Element;
    httpClient: IBSDataTableHttpClient;
    s_area: string;
    observer: IntersectionObserver;
    target: HTMLElement;
    nextPageCallback: (page: number) => void;

    constructor(options: InfiniteScrollOptions) {
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

    reset(){
        this.currentPage = 1;
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
        this.s_area = 'scroll_area_' + this.gridElement.id;

        var scrollArea = document.createElement('div');
        scrollArea.id = this.s_area;

        scrollArea.classList.add('row', 'bs-scroll');

        this.wrap(scrollArea, this.gridElement);

        var root = document.getElementById(this.s_area);
        let options = {
            root: root,
            rootMargin: '0px',
            threshold: 0.3,
            trackVisibility: false
        };

        this.observer = new IntersectionObserver((entries, sender) => this.observerCB(entries, sender), options);

        var rows = this.gridElement.querySelectorAll('tr');
        var lastRow = rows[rows.length - 1];
        var target = lastRow;
        // console.log(target, root);
        this.observe(target);
    }
}
