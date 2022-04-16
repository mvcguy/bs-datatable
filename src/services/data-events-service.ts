
import { BSEventSubscriberModel, BSWinPopEvent, BSEvent } from "../commonTypes/common-types";
import { appDataEvents } from "./data-events";

class DataEventsService {
    callbacks: BSEventSubscriberModel[];
    constructor() {
        this.callbacks = [];
        this.registerWinPopState();
    }


    registerWinPopState() {
        window.onpopstate = (e: PopStateEvent) => {
            if (e.state && e.state.eventData) {
                console.log(e.state);
                let ev: BSWinPopEvent = { EventData: e.state.eventData, SkipPush: true, DataSourceName: "" };
                this.Emit(appDataEvents.ON_FETCH_RECORD, window, ev);
            }
        };
    };

    Emit(eventName: string, source: any, eventArgs: BSEvent) {
        if (!eventName) return;
        try {
            this.callbacks.forEach((cb) => {
                if (cb.EventName !== eventName || (cb.DataSourceName !== eventArgs.DataSourceName && cb.VerifyDataSourceName === true)) {
                    console.log('source could not be matched');
                    return;
                }
                cb.Callback(source, eventArgs);
            });

        } catch (error) {
            console.error(error);
        }
    };

    Unsubscribe(model: BSEventSubscriberModel) {

        var filtered = this.callbacks
            .filter((cb) => (cb.Key === model.Key
                && cb.EventName === model.EventName
                && cb.DataSourceName === model.DataSourceName) === false);

        this.callbacks = filtered;

    }

    Subscribe(model: BSEventSubscriberModel) {
        //
        // No need to do a lookup if handler exist from before
        //
        if (!model.EventName) return;
        this.callbacks.push(model);
    };
}

export const dataEventsService = new DataEventsService();