import { BSDataTableActions, BSDataTableButton } from "../../src/components";

describe('BSDataTableActions', function () {

    it('verifies standard actions of the data-table', function () {
        var actions = new BSDataTableActions();
        actions.dataSourceName = 'ds';

        var deleted = false;
        var added = false;

        actions
            .addNewRecordAction((e) => { added = true; })
            .addDeleteAction((e) => { deleted = true; })
            .addGridSettingsAction();

        expect(actions.element.tagName).toBe('DIV');
        // expect(actions.hasClass('row')).toBe(true);
        expect(actions.hasClasses('row actions-container')).toBe(true);

        //
        // add action
        //
        var addAction = actions.children.find((x) => x.id === 'btnAddRow_ds') as BSDataTableButton;
        expect(addAction.title).toBe('Add');
        expect(addAction.hasClasses('btn btn-sm btn-outline-primary grid-toolbar-action')).toBe(true);
        addAction.element.dispatchEvent(new Event('click'));
        expect(added).toBe(true);


        //
        // delete action
        //
        var deleteAction = actions.children.find((x) => x.id === 'btnDeleteRow_ds') as BSDataTableButton;
        expect(deleteAction.title).toBe('Delete');
        expect(deleteAction.hasClasses('btn btn-sm btn-outline-danger grid-toolbar-action')).toBe(true);
        deleteAction.element.dispatchEvent(new Event('click'));
        expect(deleted).toBe(true);

        //
        // configure grid action
        //
        var settingsAction = actions.children.find((x) => x.id === 'btnSettings_ds') as BSDataTableButton;
        expect(settingsAction.title).toBe('Settings');
        expect(settingsAction.hasClasses('btn btn-sm btn-outline-primary grid-toolbar-action')).toBe(true);
        expect(settingsAction.getProp('data-bs-toggle')).toBe('modal');
        expect(settingsAction.getProp('data-bs-target')).toBe('#staticBackdrop_ds');


    })

});