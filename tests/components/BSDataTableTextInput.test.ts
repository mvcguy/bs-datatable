import { BSDataTableTextInput } from '../../src/components/BSDataTableTextInput'

it('test number input', () => {
    const txtInput = new BSDataTableTextInput('ds', 'number');
    expect(txtInput.readonly).toBe(false);

    txtInput.val = 10.11;
    expect(txtInput.val).toBe(10.11);
});

it('test date input', () => {
    const txtInput = new BSDataTableTextInput('ds', 'date');
    expect(txtInput.readonly).toBe(false);

    txtInput.val = '2011-04-04';
    expect(txtInput.val).toBe('2011-04-04');

    expect(txtInput.element['type']).toBe('date');
});

it('test text input', () => {
    const txtInput = new BSDataTableTextInput('ds');
    expect(txtInput.readonly).toBe(false);

    txtInput.val = 'Its a text';
    expect(txtInput.val).toBe('Its a text');

    expect(txtInput.element['type']).toBe('text');
});


 
