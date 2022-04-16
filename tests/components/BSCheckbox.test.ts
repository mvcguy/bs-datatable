import { BSDataTableCheckBox } from '../../src/components/BSDataTableCheckBox'

it('test checkbox setters and getters', () => {
    const input = new BSDataTableCheckBox({DataSourceName: 'ds', ModelName: 'showDetails'});

    expect(input.readonly).toBe(false);

    input.val = true;
    expect(input.val).toBe(true);

    input.val = false;
    expect(input.val).toBe(false);

    input.readonly = true;
    input.disabled = true;
    input.isKey = true;

    expect(input.readonly).toBe(true);
    expect(input.options.ModelName).toBe('showDetails');
    expect(input.disabled).toBe(true);
    expect(input.isKey).toBe(true);
    
    expect(input.element['type']).toBe('checkbox');
});

it('test clone', () => {
    const input = new BSDataTableCheckBox({DataSourceName: 'ds', ModelName: 'showDetails'});
    input.readonly = true;
    input.disabled = true;
    input.isKey = true;
    input.val = true;

    const clone = input.clone();

    expect(clone.readonly).toBe(true);
    expect(clone.options.ModelName).toBe('showDetails');
    expect(clone.disabled).toBe(true);
    expect(clone.isKey).toBe(true);
    expect(clone.val).toBe(true);
    expect(clone.element['type']).toBe('checkbox');
});




