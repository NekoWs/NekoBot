"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupBanEvent = void 0;
const NoticeEvent_1 = require("./NoticeEvent");
class GroupBanEvent extends NoticeEvent_1.NoticeEvent {
    constructor(payload) {
        super(payload);
        this.group_id = payload.group_id;
        this.user_id = payload.user_id;
        this.operator_id = payload.operator_id;
        this.duration = payload.duration;
    }
}
exports.GroupBanEvent = GroupBanEvent;
