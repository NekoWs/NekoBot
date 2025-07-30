import { MessageEvent } from "./MessageEvent"

/**
 * 私聊事件
 */
export class PrivateMessageEvent extends MessageEvent {
    constructor(payload: any) {
        super(payload)
    }
}