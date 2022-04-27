import { BSDataTableColDefinition } from "../../src/commonTypes/common-types";
import { BSDataTableCell, BSDataTableHeader, BSDataTableRow } from "../../src/components"

it('verify table header props', function () {
    var header = new BSDataTableHeader();

    var col: BSDataTableColDefinition = {
        DisplayName: "First name",
        DataType: 'text',
        Width: '120px',
        PropName: 'first_name'
    };
    var cell = new BSDataTableCell(col, true);

    var row = new BSDataTableRow({
        dataSourceName: 'ds',
        gridId: 'grid',
        gridHeader: true
    })

    row.addCell(cell);
    header.addRow(row);
    var container = document.createElement('table');
    container.append(header.element);

    expect(header.element.tagName).toBe('THEAD');
    expect(header.hasClass('table-light')).toBe(true);

    var expectedHtml = '<thead class="table-light"><tr class="draggable grid-cols" data-rowindex="1" id="grid_head_1"><th class="sorting ds-col">First name</th></tr></thead>';

    expect(container.innerHTML).toBe(expectedHtml);

})