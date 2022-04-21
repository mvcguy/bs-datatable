import { dataEventsService } from "../../src/services/data-events-service";
import { BSEventHandler, BSEventSubscriberModel } from "../../src/commonTypes/common-types";

export class TestHelpers {
    static addHandler(eventName: string, callback: BSEventHandler, verifyDSName = false) {
        let model: BSEventSubscriberModel = {
            Key: 'grid',
            EventName: eventName,
            Callback: callback,
            DataSourceName: 'ds',
            VerifyDataSourceName: verifyDSName
        };
        dataEventsService.Subscribe(model);
    };
}
