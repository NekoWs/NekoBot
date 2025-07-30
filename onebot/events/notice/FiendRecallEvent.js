"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRecallEvent = void 0;
const RecallEvent_1 = require("./RecallEvent");
class FriendRecallEvent extends RecallEvent_1.RecallEvent {
    constructor(payload) {
        super(payload);
    }
}
exports.FriendRecallEvent = FriendRecallEvent;
