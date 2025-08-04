"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupBanEvent = void 0;
const GroupNoticeEvent_1 = require("./GroupNoticeEvent");
class GroupBanEvent extends GroupNoticeEvent_1.GroupNoticeEvent {
    constructor(payload) {
        super(payload);
        this.user_id = payload.user_id;
        this.operator_id = payload.operator_id;
        this.duration = payload.duration;
    }
}
exports.GroupBanEvent = GroupBanEvent;
