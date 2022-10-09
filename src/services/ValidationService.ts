import { Tooltip } from "bootstrap";
import { BSEvent, BSEventHandler, BSEventSubscriberModel, BSInputControlOptions, BSValidationOptions, BSValidationRule, ControlValidationModel } from "../commonTypes/common-types";
import { dataEventsService } from "./data-events-service";

export class BSValidationHelper {
    static CreateControlOptions(ctrlOptions: (options: BSInputControlOptions) => void | BSInputControlOptions) {
        var ctrl: BSInputControlOptions;
        if (typeof ctrlOptions == "function") {
            var opt: BSInputControlOptions = { Rules: [] };
            ctrlOptions(opt);
            ctrl = opt;
        }
        else {
            ctrl = ctrlOptions;
        }
        return ctrl;
    }

}

export class BSValidationService {
    Options: BSValidationOptions;
    ValidationResult: ControlValidationModel[] = [];
    IsValid: boolean;
    constructor(options?: BSValidationOptions) {
        this.Options = options;
        this.IsValid = true;
        if (!options.ControlErrorClass) {
            options.ControlErrorClass = 'form-control-danger';
        }

        if (!options.TooltipClass) {
            options.TooltipClass = 'tooltip-error';
        }
    }


    notifyListeners(eventType: string, payload: BSEvent) {
        dataEventsService.Emit(eventType, this, payload);
    }

    /**
     * Add handler to the events raised by the data table
     * @param eventName 
     * @param callback 
     * @param verifyDSName 
     */
    addHandler(eventName: string, callback: BSEventHandler, verifyDSName = false) {
        let model: BSEventSubscriberModel = {
            Key: this.Options.ValidatorName,
            EventName: eventName,
            Callback: callback,
            DataSourceName: this.Options.DataSourceName,
            VerifyDataSourceName: verifyDSName
        };
        dataEventsService.Subscribe(model);
    };

    removeHandler(eventName: string) {
        let model: BSEventSubscriberModel = {
            Key: this.Options.ValidatorName,
            EventName: eventName,
            DataSourceName: this.Options.DataSourceName,
        };
        dataEventsService.Unsubscribe(model);
    };

    /**
     * 
     * @param ctrlOptions 
     * @returns Returns the control which is being verified
     */
    GetControl(ctrlOptions: BSInputControlOptions): HTMLInputElement {
        if (ctrlOptions.Control) return ctrlOptions.Control;

        var ctrl = document.getElementById(ctrlOptions.Id);
        if (ctrl instanceof HTMLInputElement) {
            return ctrl;
        }

        return undefined;
    }

    AddValidationFor(ctrlOptions: (options: BSInputControlOptions) => void | BSInputControlOptions) {
        var opt = BSValidationHelper.CreateControlOptions(ctrlOptions)
        this.Options.Controls.push(opt);
        this.RegisterHandler(opt);
        return this;
    }

    _GetMessageNode(ctrl: HTMLInputElement): HTMLElement {
        var wrapper = document.createElement('div');
        this.AddWrapper(wrapper, ctrl);
        var msgNode = this.AppendMessageNode(wrapper, this.Options.ErrorMessageClass);
        msgNode.hidden = true;
        return msgNode;
    }

    _GetTooltip(ctrl: HTMLInputElement): Tooltip {
        var tooltip = new Tooltip(ctrl, { customClass: this.Options.TooltipClass });

        return tooltip;
    }

    RegisterHandler(ctrlOptions: BSInputControlOptions) {
        var ctrl = this.GetControl(ctrlOptions);
        var validationModel: ControlValidationModel = { Control: ctrl, Options: ctrlOptions, IsValid: true, Messages: [], ExistingTooltip: ctrl.title };

        //
        // ToolTip or a message label under the control
        //
        if (this.Options.ShowMessagesAsToolTips === false) {
            validationModel.MessageNode = this._GetMessageNode(ctrl);
        }
        else {
            validationModel.MessageTooltip = this._GetTooltip(ctrl);
        }

        this.ValidationResult.push(validationModel);

        ctrl.addEventListener('blur', ev => {
            this.Validate(validationModel);
        });
    }

    RegisterHandlers() {
        this.Options.Controls.forEach(ctrlOptions => this.RegisterHandler(ctrlOptions));
    }

    _SetMessage(model: ControlValidationModel) {
        if (this.Options.ShowMessagesAsToolTips === true)
            this._SetToolTip(model);
        else
            this._SetMessageNode(model);

        if (!model.Control.classList.contains(this.Options.ControlErrorClass)) {
            model.Control.classList.add(this.Options.ControlErrorClass);
        }
    }

    _SetMessageNode(model: ControlValidationModel) {
        model.MessageNode.innerHTML = model.Messages.join('<br />');
        model.MessageNode.hidden = false;

    }

    _SetToolTip(model: ControlValidationModel) {
        var msg = model.Messages.join('<br />');
        model.MessageTooltip.setContent({ '.tooltip-inner': msg });
        model.MessageTooltip.enable();
    }

    _ResetToolTip(model: ControlValidationModel) {
        model.MessageTooltip.disable();

        //
        // restore existing tooltip
        //
        model.Control.title = model.ExistingTooltip;
    }

    _ResetMessageNode(model: ControlValidationModel) {
        model.MessageNode.hidden = true;
        model.MessageNode.innerHTML = '';
    }

    _ResetMessage(model: ControlValidationModel) {
        if (this.Options.ShowMessagesAsToolTips === false)
            this._ResetMessageNode(model);
        else
            this._ResetToolTip(model);

        model.Control.classList.remove(this.Options.ControlErrorClass);
        model.IsValid = true;
        model.Messages = [];
    }

    ResetAll() {
        this.IsValid = true;
        this.ValidationResult.forEach(model => this._ResetMessage(model));
    }

    Clear() {
        this.ValidationResult.forEach(model => {

            if (this.Options.ShowMessagesAsToolTips === true && model.MessageTooltip) {
                model.MessageTooltip.dispose();
            }

            if (model.MessageNode) {
                model.MessageNode.remove();
            }
        });

        this.ValidationResult = [];
        this.Options.Controls = [];

        // TODO: Find a way to remove/detach the blur events as well from the input controls

    }

    ValidateAll() {
        this.ResetAll();
        this.ValidationResult.forEach(model => this.Validate(model));

        if (this.Options.OnValidated) {
            this.Options.OnValidated(this, { Valid: this.IsValid })
        }
    }

    Validate(model: ControlValidationModel) {
        //var valid = true;
        //var msgs: string[] = [];
        var ctrl = model.Control;

        // reset previous results
        model.Messages = [];
        model.IsValid = true;


        if (!model.Options.Rules) return true;

        model.Options.Rules.forEach(rule => {

            if (rule.RuleType === "REQUIRED") {
                if (ctrl.value.length <= 0) {
                    //console.log('length validation failed');
                    model.IsValid = false;
                    model.Messages.push(rule.ErrorMessage);
                }
            } else if (rule.RuleType === "RANGE") {
                var numValue = parseInt(ctrl.value); // TODO: Handle values of type float and date

                if (numValue < rule.Start || numValue > rule.End) {
                    model.Messages.push(rule.ErrorMessage);
                    model.IsValid = false;
                }

            } else if (rule.RuleType === "LENGTH") {
                if ((rule.Length && ctrl.value.length != rule.Length) || ((rule.MaxLength && rule.MinLength)
                    && (ctrl.value.length < rule.MinLength || ctrl.value.length > rule.MaxLength))) {
                    model.Messages.push(rule.ErrorMessage);
                    model.IsValid = false;
                }
            } else if (rule.RuleType === "GENERAL") {
                // TODO: How to set generic errors?
            }
        });

        if (model.Messages && !model.IsValid) {
            this._SetMessage(model);
        }
        else {
            this._ResetMessage(model);
        }

        if (!model.IsValid) {
            this.IsValid = false;
        }

        return model.IsValid;
    }

    AppendMessageNode(control: Element, cls: string) {
        var msg = document.createElement('div');
        msg.classList.add(cls);
        control.appendChild(msg);
        return msg;
    }

    AddWrapper(wrapper: HTMLElement, nodes: HTMLElement) {
        nodes.parentElement.insertBefore(wrapper, nodes);
        wrapper.appendChild(nodes);
    }
}

export class BSFluentValidationBuilder {
    Options: BSValidationOptions;

    constructor(options?: BSValidationOptions) {
        this.Options = options ?? { Controls: [] };
    }

    static CreateBuilder() {
        return new BSFluentValidationBuilder();
    }

    AddValidationFor(ctrlOptions: (options: BSInputControlOptions) => void | BSInputControlOptions) {
        this._ConfigureControl(ctrlOptions);
        return this;
    }

    ErrorMessageClass(cls: string) {
        this.Options.ErrorMessageClass = cls;
        return this;
    }

    ShowMessagesAsToolTips(val: boolean) {
        this.Options.ShowMessagesAsToolTips = val;
        return this;
    }

    TooltipClass(val: string) {
        this.Options.TooltipClass = val;
        return this;
    }

    ControlErrorClass(cls: string) {
        this.Options.ControlErrorClass = cls;
        return this;
    }

    OnValidated(callback: (sender: any, args: any) => void) {
        this.Options.OnValidated = callback;
        return this;
    }

    Build() {
        return new BSValidationService(this.Options);
    }

    _ConfigureControl(ctrlOptions: (options: BSInputControlOptions) => void | BSInputControlOptions) {
        var ctrl: BSInputControlOptions;
        if (typeof ctrlOptions == "function") {
            var opt: BSInputControlOptions = { Rules: [] };
            ctrlOptions(opt);
            ctrl = opt;
        }
        else {
            ctrl = ctrlOptions;
        }

        this.Options.Controls.push(ctrl);
        return this;
    }

}
