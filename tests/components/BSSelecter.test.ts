import { BSSelectorOptions } from 'src/commonTypes/common-types';
import { BSDataTableSelector } from '../../src/components/BSDataTableSelector'

it('test select values', () => {

    var btnClicked = false;
    let options: BSSelectorOptions = {
        DataSourceName: 'ds',
        PropName: 'inventoryId',
        BtnId: 'btnInventoryId',
        CssClass: "form-control form-control-sm",
        ElementId: 'selInventoryId',
        InputType: "text",
        PlaceHolder: 'Inventory ID',
        BtnClick: (sender: BSDataTableSelector, e) => {
            btnClicked = true;
        }
    };
    const inventoryId = new BSDataTableSelector(options);

    expect(inventoryId.txtElement.readonly).toBe(false);

    inventoryId.txtElement.val = "VAR001";
    expect(inventoryId.txtElement.val).toBe("VAR001");

    inventoryId.txtElement.disabled = true;
    inventoryId.txtElement.isKey = true;

    expect(inventoryId.txtElement.modelName).toBe('inventoryId');
    expect(inventoryId.txtElement.disabled).toBe(true);
    expect(inventoryId.txtElement.isKey).toBe(true);

    //
    // click the button
    //
    inventoryId.btnElement.element.dispatchEvent(new Event('click'));
    expect(btnClicked).toBe(true);

    //
    // verify that a wrapper exist around the text box and the selector button
    //
    var parent = inventoryId.txtElement.element.parentElement;
    expect(parent.tagName).toBe('DIV');
    expect(parent.classList.contains('input-group')).toEqual(true);
    expect(parent.classList.contains('input-group-sm')).toEqual(true);

    expect(parent).toEqual(inventoryId.btnElement.element.parentElement);
    expect(inventoryId.element).toEqual(parent);

});

it('tests clone of the select component', () => {
    var btnClicked = false;
    let options: BSSelectorOptions = {
        DataSourceName: 'ds',
        PropName: 'inventoryId',
        BtnId: 'btnInventoryId',
        CssClass: "form-control form-control-sm",
        ElementId: 'selInventoryId',
        InputType: "text",
        PlaceHolder: 'Inventory ID',
        BtnClick: (sender: BSDataTableSelector, e) => {
            btnClicked = true;
        }
    };
    const inventoryId = new BSDataTableSelector(options);
    var clone = inventoryId.clone();

    expect(clone.txtElement.readonly).toBe(false);

    clone.txtElement.val = "VAR001";
    expect(clone.txtElement.val).toBe("VAR001");

    clone.txtElement.disabled = true;
    clone.txtElement.isKey = true;

    expect(clone.txtElement.modelName).toBe('inventoryId');
    expect(clone.txtElement.disabled).toBe(true);
    expect(clone.txtElement.isKey).toBe(true);

    //
    // click the button
    //
    clone.btnElement.element.dispatchEvent(new Event('click'));
    expect(btnClicked).toBe(true);

    //
    // verify that a wrapper exist around the text box and the selector button
    //
    var parent = clone.txtElement.element.parentElement;
    expect(parent.tagName).toBe('DIV');
    expect(parent.classList.contains('input-group')).toEqual(true);
    expect(parent.classList.contains('input-group-sm')).toEqual(true);
    expect(parent).toEqual(clone.btnElement.element.parentElement);
    expect(clone.element).toEqual(parent);


});




