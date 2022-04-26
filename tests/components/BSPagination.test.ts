import { BSDataTablePaginationOptions, BSDataTablePagingMetaData } from "../../src/commonTypes/common-types";
import { BSDataTablePagination } from "../../src/components"

function getPaginator(request: any) {
    var paginator = new BSDataTablePagination({
        dataSourceName: request.ds,
        metaData: new BSDataTablePagingMetaData(1, 10, 40),
        nextPageCallback: page => {
            request.currentPage = page;
        }
    });

    paginator.render();
    var container = document.createElement('div');
    container.appendChild(paginator.element);

    return paginator;
}

describe('BSDataTablePagination', function () {
    it('Verify props of the pagination component', function () {

        var request = { currentPage: -1, ds: 'ds1' };
        var paginator = getPaginator(request);

        expect(paginator.pageLinks.length).toBe(4);
        paginator.pageLinks.forEach((link, index) => {
            expect(link.element.textContent).toBe(`${index + 1}`);
            expect(link.hasClass('page-link')).toBe(true);
            expect(link.getProp('data-p-index')).toBe(`${index + 1}`);
            expect(link.element.tagName).toBe('A');
            var parent = link.element.parentElement;
            expect(parent.tagName).toBe('LI');
            expect(parent.classList.contains('page-item')).toBe(true);
            var grandParent = parent.parentElement;
            expect(grandParent.tagName).toBe('UL');
            expect(grandParent.id).toBe('pg_list_ds1');
            expect(grandParent.classList.contains('pagination')).toBe(true);
            expect(grandParent.classList.contains('justify-content-end')).toBe(true);
            var nav = grandParent.parentElement;
            expect(nav.tagName).toBe('NAV');
            var navContainer = nav.parentElement;
            expect(navContainer.id).toBe('pg_container_ds1');
            expect(navContainer.tagName).toBe('DIV');

            link.element.dispatchEvent(new Event('click'));
            expect(request.currentPage).toBe(index + 1);
        });
    })

    it('verifies that selected page number is focused when clicked', function () {
        var request = { currentPage: -1, ds:'ds2' };
        var paginator = getPaginator(request);

        var page2 = paginator.pageLinks.find((x) => x.getProp('data-p-index') === "2");
        page2.element.dispatchEvent(new Event('click'));
        //
        // only page2 should be active
        //
        paginator.pageLinks.forEach((link) => {
            var li = link.element.parentElement;
            if (link.getProp('data-p-index') === "2") {                
                expect(li.classList.contains('active')).toBe(true);
            }
            else {
                expect(li.classList.contains('active')).toBe(false);
            }
        });

    });

    it('verifies clear function of the paginator', function () {
        var request = { currentPage: -1, ds:'ds3' };
        var paginator = getPaginator(request);

        var countPages = paginator.element.querySelectorAll('.page-item').length;
        expect(countPages).toBe(4);        
        expect(paginator.pageLinks.length).toBe(countPages);
        paginator.clear();

        countPages = paginator.element.querySelectorAll('.page-item').length;
        expect(countPages).toBe(0);    
        expect(paginator.pageLinks.length).toBe(countPages);
    });
})