import { BSDataTableCheckBox } from '../../src/components/BSDataTableCheckBox'

it('test checkbox setters and getters', () => {
    const txtInput = new BSDataTableCheckBox('ds');

    expect(txtInput.readonly).toBe(false);

    txtInput.val = true;
    expect(txtInput.val).toBe(true);

    txtInput.val = false;
    expect(txtInput.val).toBe(false);

    txtInput.readonly = true;
    txtInput.modelName = 'showDetails';
    txtInput.disabled = true;
    txtInput.isKey = true;

    expect(txtInput.readonly).toBe(true);
    expect(txtInput.modelName).toBe('showDetails');
    expect(txtInput.disabled).toBe(true);
    expect(txtInput.isKey).toBe(true);
    
    expect(txtInput.element['type']).toBe('checkbox');
});

it('test clone', () => {
    const txtInput = new BSDataTableCheckBox('ds');
    txtInput.readonly = true;
    txtInput.modelName = 'showDetails';
    txtInput.disabled = true;
    txtInput.isKey = true;
    txtInput.val = true;

    const clone = txtInput.clone();

    expect(clone.readonly).toBe(true);
    expect(clone.modelName).toBe('showDetails');
    expect(clone.disabled).toBe(true);
    expect(clone.isKey).toBe(true);
    expect(clone.val).toBe(true);
    expect(clone.element['type']).toBe('checkbox');
});




