"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeEvent = void 0;
const Event_1 = require("../Event");
class NoticeEvent extends Event_1.Event {
    constructor(payload) {
        super(payload);
        this.notice_type = payload.notice_type;
        this.sub_type = payload.sub_type;
    }
}
exports.NoticeEvent = NoticeEvent;
