
import { appDataEvents } from "./data-events";

class DataEventsService {
    callbacks: any[];
    constructor() {
        this.callbacks = [];
        this.registerWinPopState();
    }


    registerWinPopState() {
        var _this = this;
        window.onpopstate = function (e) {
            if (e.state && e.state.eventData) {
                console.log(e.state);
                _this.notifyListeners(appDataEvents.ON_FETCH_RECORD, { eventData: e.state.eventData, skipPush: true });
            }
        };
    };

    notifyListeners(eventType: string, eventArgs: { eventData?: string; skipPush?: boolean; dataSourceName?: string; }) {
        if (!eventType) return;
        try {
            this.callbacks.forEach((cb) => {
                // TODO: Check for datasourcname???
                if (cb.eventType !== eventType || (cb.dataSourceName !== eventArgs.dataSourceName && cb.verifyDSName === true)) return;
                // if (this.eventType !== eventType) return;

                cb.callback(eventArgs);
            });

        } catch (error) {
            console.error(error);
        }
    };

    unRegisterCallback(keyX: string, eventTypeX: string, dataSourceNameX: string) {

        var filtered = this.callbacks
            .filter((cb) => !(cb.key === keyX && cb.eventType === eventTypeX && cb.dataSourceName === dataSourceNameX));

        this.callbacks = filtered;

    }

    registerCallback(keyX: string, eventTypeX: string, callback: any, dataSourceNameX: string, verifyDSName = false) {
        //
        // search if callback exist from before : TODO: No need to do a lookup if handler exist from before
        //
        if (!eventTypeX) return;
        // var index = this.callbacks
        //     .findIndex(({ key, eventType, dataSourceName }) => key === keyX
        //         && eventType === eventTypeX
        //         && dataSourceName === dataSourceNameX);
        //  console.log('index: ', index);
        //if (index === -1) {

        this.callbacks.push({
            key: keyX,
            eventType: eventTypeX,
            callback: callback,
            dataSourceName: dataSourceNameX,
            verifyDSName
        });
        //}
    };

    invokeCallback(eventType: string, payload: any) {
        var resultArray = [];

        this.callbacks.forEach((cb) => {
            if (cb.eventType === eventType) {
                var result = cb.callback(payload);
                var dataSourceName = cb.dataSourceName;
                resultArray.push({ data: result, dataSourceName: dataSourceName });
                console.log("invokeCallback: Event:", eventType, " payload: ", payload, " Result: ", result);
            }

        });

        return resultArray;
    }

}

export const dataEventsService = new DataEventsService();