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


    static toDateDisplayFormat(date: Date) {
        var day = date.getDate(),
            month = date.getMonth() + 1, // month starts from zero in js - very strange?
            year = date.getFullYear();

        let monthStr = (month < 10 ? "0" : "") + month;
        let dayStr = (day < 10 ? "0" : "") + day;

        return year + "-" + monthStr + "-" + dayStr;
    }

}
