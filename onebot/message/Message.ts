export const MessageTypeMap = {
    text:       "文本",
    face:       "表情",
    image:      "图片",
    record:     "语音",
    video:      "视频",
    at:         "@",
    rps:        "猜拳",
    dice:       "骰子",
    shake:      "窗口抖动",
    poke:       "戳一戳",
    share:      "分享",
    contact:    "推荐好友/群",
    location:   "位置",
    music:      "音乐",
    reply:      "回复消息",
    forward:    "转发消息",
    node:       "转发消息节点",
    json:       "JSON消息",
    mface:      "表情包",
    file:       "文件",
    markdown:   "Markdown",
    lightapp:   "小程序卡片"
} as const

export type MessageType = keyof typeof MessageTypeMap

export class Message {
    readonly type: MessageType
    readonly data: any
    constructor(payload: any) {
        this.type = payload.type
        this.data = payload.data
    }
    toJson() {
        return {
            type: this.type,
            data: this.data
        }
    }
}