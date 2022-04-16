import { BSDataTableTextInput } from '../../src/components/BSDataTableTextInput'

it('test number input', () => {
    const txtInput = new BSDataTableTextInput({DataSourceName: 'ds', ModelName: 'qty', InputType: 'number'});
    expect(txtInput.readonly).toBe(false);

    txtInput.val = 10.11;
    expect(txtInput.val).toBe(10.11);
});

it('test date input', () => {
    const txtInput = new BSDataTableTextInput({DataSourceName: 'ds', ModelName: 'purchaseDate', InputType: 'date'});
    expect(txtInput.readonly).toBe(false);

    txtInput.val = '2011-04-04';
    expect(txtInput.val).toBe('2011-04-04');

    expect(txtInput.element['type']).toBe('date');
});

it('test text input', () => {
    const txtInput = new BSDataTableTextInput({DataSourceName: 'ds', ModelName: 'comments'});
    expect(txtInput.readonly).toBe(false);

    txtInput.val = 'Its a text';
    expect(txtInput.val).toBe('Its a text');

    expect(txtInput.element['type']).toBe('text');
});

it('test getters and setters', () => {
    const txtInput = new BSDataTableTextInput({DataSourceName: 'ds', ModelName: 'firstName', InputType: 'text'});
    txtInput.readonly = true;
    txtInput.disabled = true;
    txtInput.isKey = true;

    expect(txtInput.readonly).toBe(true);
    expect(txtInput.options.ModelName).toBe('firstName');
    expect(txtInput.disabled).toBe(true);
    expect(txtInput.isKey).toBe(true);
});

it('test clone', () => {
    const txtInput = new BSDataTableTextInput({DataSourceName: 'ds', ModelName: 'firstName'});
    txtInput.readonly = true;
    txtInput.disabled = true;
    txtInput.isKey = true;
    txtInput.val = 'Shahid';

    const clone = txtInput.clone();

    expect(clone.readonly).toBe(true);
    expect(clone.options.ModelName).toBe('firstName');
    expect(clone.disabled).toBe(true);
    expect(clone.isKey).toBe(true);
    expect(clone.val).toBe('Shahid');
    expect(clone.element['type']).toBe('text');
});




