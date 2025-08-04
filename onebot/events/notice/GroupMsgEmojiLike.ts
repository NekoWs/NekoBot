import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupMsgEmojiLike extends GroupNoticeEvent {
    /**
     * 操作的用户 QQ 号
     */
    readonly user_id: number

    /**
     * 消息 ID
     */
    readonly message_id: number

    /**
     * 回应表情列表
     */
    readonly likes: EmojiLike[] = []

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.message_id = payload.message_id
        payload.likes.forEach((item: any) => {
            this.likes.push(new EmojiLike(item))
        })
    }
}

class EmojiLike {
    /**
     * 表情 ID
     */
    readonly emoji_id: number

    /**
     * 数量
     */
    readonly count: number
    constructor(payload: any) {
        this.emoji_id = payload.emoji_id
        this.count = payload.count
    }
}