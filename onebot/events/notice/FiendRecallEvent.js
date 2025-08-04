"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRecallEvent = void 0;
const NoticeEvent_1 = require("./NoticeEvent");
class FriendRecallEvent extends NoticeEvent_1.NoticeEvent {
    constructor(payload) {
        super(payload);
        this.message_id = payload.message_id;
        this.user_id = payload.user_id;
    }
}
exports.FriendRecallEvent = FriendRecallEvent;
