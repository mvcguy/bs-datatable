
import { appDataEvents } from "./data-events";

class DataEventsService {
    callbacks: any[];
    constructor() {
        this.callbacks = [];
        this.registerWinPopState();
    }


    registerWinPopState() {
        var _this = this;
        window.onpopstate= function(e) {
            if (e.state && e.state.eventData) {
                console.log(e.state);
                _this.notifyListeners(appDataEvents.ON_FETCH_RECORD, { eventData: e.state.eventData, skipPush: true });
            }
        };
    };

    notifyListeners(eventType: string, eventArgs: { eventData?: string; skipPush?: boolean; dataSourceName?: string; }) {
        if (!eventType) return;
        try {
            $.each(this.callbacks, function () {
                // TODO: Check for datasourcname???
                if (this.eventType !== eventType || (this.dataSourceName !== eventArgs.dataSourceName && this.verifyDSName === true)) return;
                // if (this.eventType !== eventType) return;

                this.callback(eventArgs);
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

        $.each(this.callbacks, function () {
            if (this.eventType === eventType) {
                var result = this.callback(payload);
                var dataSourceName = this.dataSourceName;
                resultArray.push({ data: result, dataSourceName: dataSourceName });
                console.log("invokeCallback: Event:", eventType, " payload: ", payload, " Result: ", result);
            }

        });

        return resultArray;
    }

}

export const dataEventsService = new DataEventsService();