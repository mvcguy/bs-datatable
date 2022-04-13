import { BSDataTableButton } from '../../src';
it('verfies button element', () => {

    var btnClicked = false;
    const btnSave = new BSDataTableButton({
        DataSourceName: 'ds', Icon: 'save', Handler: (e) => {
            btnClicked = true;
        }
    });

    expect(btnSave.dataSourceName).toBe('ds');
    expect(btnSave.hasClass('btn')).toBe(true);
    expect(btnSave.hasClass('btn-outline-primary')).toBe(true);
    btnSave.element.dispatchEvent(new Event('click'));
    expect(btnClicked).toBe(true);
    expect(btnSave.element.tagName).toBe('BUTTON');
});

it('verfies clone of the button element', () => {

    var btnClicked = false;
    const btnSave = new BSDataTableButton({
        DataSourceName: 'ds', Icon: 'save', Handler: (e) => {
            btnClicked = true;
        }
    });

    var clone = btnSave.clone();

    expect(clone.dataSourceName).toBe('ds');
    expect(clone.hasClass('btn')).toBe(true);
    expect(clone.hasClass('btn-outline-primary')).toBe(true);
    clone.element.dispatchEvent(new Event('click'));
    expect(btnClicked).toBe(true);
    expect(clone.element.tagName).toBe('BUTTON');
});




