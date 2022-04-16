import { BSDataTableSelect } from '../../src/components/BSDataTableSelect'

it('test select values', () => {
    const countries = new BSDataTableSelect({
        DataSourceName: 'ds',
        SelectOptions: [
            { text: 'Pakistan', value: 'PK', isSelected: true },
            { text: 'Norway', value: 'NO', isSelected: false },
            { text: 'Turkey', value: 'TR', isSelected: false }
        ],
        ModelName: 'selCountries'
    });

    expect(countries.readonly).toBe(false);
    expect(countries.val).toBe("PK");

    countries.val = "NO";
    expect(countries.val).toBe("NO");

    countries.disabled = true;
    countries.isKey = true;

    expect(countries.options.ModelName).toBe('selCountries');
    expect(countries.disabled).toBe(true);
    expect(countries.isKey).toBe(true);

    var select = countries.element as HTMLSelectElement;
    expect(select.options.length).toBe(3);
});

it('tests clone of the select component', () => {
    const countries = new BSDataTableSelect({
        DataSourceName: 'ds',
        SelectOptions: [
            { text: 'Pakistan', value: 'PK', isSelected: true },
            { text: 'Norway', value: 'NO', isSelected: false },
            { text: 'Turkey', value: 'TR', isSelected: false }
        ],
        ModelName: 'selCountries'

    });

    var clone = countries.clone();
    expect(clone.readonly).toBe(false);
    expect(clone.val).toBe("PK");

    clone.val = "NO";
    expect(clone.val).toBe("NO");

    clone.disabled = true;
    clone.isKey = true;

    expect(clone.options.ModelName).toBe('selCountries');
    expect(clone.disabled).toBe(true);
    expect(clone.isKey).toBe(true);

    var select = clone.element as HTMLSelectElement;
    expect(select.options.length).toBe(3);
});





