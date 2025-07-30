"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecallEvent = void 0;
const NoticeEvent_1 = require("./NoticeEvent");
class RecallEvent extends NoticeEvent_1.NoticeEvent {
    constructor(payload) {
        super(payload);
        this.message_id = payload.message_id;
        this.user_id = payload.user_id;
    }
}
exports.RecallEvent = RecallEvent;
