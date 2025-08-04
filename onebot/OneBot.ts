/* 使用反向 WebSocket 调用支持 OneBot 协议的框架 */
import {Event} from "./events/Event"
import {Action} from "./utils/Action"
import {MessageEvent} from "./events/MessageEvent"
import {PrivateMessageEvent} from "./events/PrivateMessageEvent";
import {Group} from "./contact/Group";
import {Friend} from "./contact/Friend";
import {NoticeEvent} from "./events/notice/NoticeEvent";
import {PokeEvent} from "./events/notice/PokeEvent";
import {GroupMessageEvent} from "./events/GroupMessageEvent";
import {FriendRecallEvent} from "./events/notice/FiendRecallEvent";
import {GroupRecallEvent} from "./events/notice/GroupRecallEvent";
import {GroupBanEvent} from "./events/notice/GroupBanEvent";
import {OpenEvent} from "./events/OpenEvent";
import {HeartBeatEvent} from "./events/HeartBeatEvent";
import {LifeCycleEvent} from "./events/LifeCycleEvent";
import {MessageChain} from "./message/MessageChain";
import {GroupAdminEvent} from "./events/notice/GroupAdminEvent";
import {GroupIncreaseEvent} from "./events/notice/GroupIncreaseEvent";
import {GroupNameEvent} from "./events/notice/GroupNameEvent";
import {GroupNoticeEvent} from "./events/notice/GroupNoticeEvent";
import {GroupDecreaseEvent} from "./events/notice/GroupDecreaseEvent";
import {EssenceEvent} from "./events/notice/EssenceEvent";
import {GroupTitleEvent} from "./events/notice/GroupTitleEvent";
import {ProfileLikeEvent} from "./events/notice/ProfileLikeEvent";
import {GroupUploadEvent} from "./events/notice/GroupUploadEvent";
import {GroupMsgEmojiLike} from "./events/notice/GroupMsgEmojiLike";
import {FriendAddEvent} from "./events/notice/FriendAddEvent";
import {InputStatusEvent} from "./events/notice/InputStatusEvent";

class Pair<T> {
    constructor(public first: T, public second: T) { }
}

export const bots = new Map<number, Client>()

type EventMap = {
    open:                       OpenEvent,          // [x] 连接成功事件
    event:                      Event,              // [x] 所有事件
    meta_event:                 Event,              // [x] 元事件
    lifecycle:                  LifeCycleEvent,     // [x] 生命周期
    heartbeat:                  HeartBeatEvent,     // [x] 心跳
    message:                    MessageEvent,       // [x] 消息事件
    private_message:            MessageEvent,       // [x] 私聊事件
    group_message:              GroupMessageEvent,  // [x] 群聊事件
    message_sent:               Event,              // [ ] 消息发送事件
    private_message_sent:       Event,              // [ ] 私聊消息发送事件
    group_message_sent:         Event,              // [ ] 群聊消息发送事件
    request:                    Event,              // [ ] 请求事件
    friend_request:             Event,              // [ ] 添加好友请求事件
    add_group_request:          Event,              // [ ] 加群请求事件
    invite_group_request:       Event,              // [ ] 邀请登录号入群
    notice:                     NoticeEvent,        // [x] 通知事件
    friend_add_notice:          FriendAddEvent,     // [x] 好友添加事件
    friend_recall_notice:       FriendRecallEvent,  // [x] 好友撤回事件
    group_notice:               GroupNoticeEvent,   // [x] 群通知事件
    group_admin_notice:         GroupAdminEvent,    // [x] 群管理员变动事件
    group_ban_notice:           GroupBanEvent,      // [x] 群禁言事件
    group_card_notice:          Event,              // [ ] 群成员名片更新事件
    group_decrease_notice:      GroupDecreaseEvent, // [x] 群成员减少事件
    group_increase_notice:      GroupIncreaseEvent, // [x] 群成员增加事件
    group_recall_notice:        GroupRecallEvent,   // [x] 群撤回消息事件
    group_upload_notice:        GroupUploadEvent,   // [x] 群文件上传事件
    group_msg_emoji_like:       GroupMsgEmojiLike,  // [x] 群消息表情回应
    essence_notice:             EssenceEvent,       // [x] 群设精事件
    notify_poke_notice:         PokeEvent,          // [x] 戳一戳事件
    notify_input_status_notice: InputStatusEvent,   // [ ] 输入状态更新事件
    notify_title_notice:        GroupTitleEvent,    // [x] 群头衔变更事件
    notify_profile_like_notice: ProfileLikeEvent    // [x] 资料卡点赞事件
    notify_group_name_notice:   GroupNameEvent,     // [x] 群名修改事件
}

export class Client {
    bot_id: number = -1
    private ws: WebSocket
    private handlers: Pair<(value: any) => void>[] = []
    private listeners: {
        [K in keyof EventMap]?: ((event: EventMap[K]) => any)[]
    } = {}

    /**
     * OneBot 客户端
     *
     * @param host WebSocket 服务器地址
     * @param port 端口
     * @param token Token
     */
    constructor(host: string, port: number, token: string) {
        this.ws = new WebSocket(`ws://${host}:${port}/?access_token=${token}`)

        this.ws.onerror = (e) => {
            throw e
        }

        this.ws.onopen = () => {
            this.ws.onmessage = event => {
                let data = JSON.parse(event.data)
                if (data.post_type) {
                    switch (data.post_type) {
                        case "meta_event":
                            switch (data.meta_event_type) {
                                case "lifecycle":
                                    this.emit("lifecycle", new LifeCycleEvent(data))
                                    bots.set(data.self_id, this)
                                    this.bot_id = data.self_id
                                    break
                                case "heartbeat":
                                    this.emit("heartbeat", new HeartBeatEvent(data))
                                    break
                            }
                            break
                        case "message":
                            let event
                            switch (data.message_type) {
                                case "group":
                                    event = new GroupMessageEvent(data)
                                    this.emit("group_message", event)
                                    break
                                case "private":
                                    event = new PrivateMessageEvent(data)
                                    this.emit("private_message", event)
                                    break
                                default: // other?
                                    event = new MessageEvent(data)
                                    break
                            }
                            this.emit("message", event)
                            break
                        case "message_sent":
                            // TODO: 用途不明，暂时不需要
                            break
                        case "request":
                            // TODO: 暂时无法测试
                            break
                        case "notice":
                            this.emit("notice", new NoticeEvent(data))

                            switch (data.notice_type) {
                                case "notify":
                                    switch (data.sub_type) {
                                        case "poke":
                                            this.emit("notify_poke_notice", new PokeEvent(data))
                                            break
                                        case "group_name":
                                            this.emit("notify_group_name_notice", new GroupNameEvent(data))
                                            break
                                        case "title":
                                            this.emit("notify_title_notice", new GroupTitleEvent(data))
                                            break
                                        case "profile_like":
                                            this.emit("notify_profile_like_notice", new ProfileLikeEvent(data))
                                            break
                                        case "input_status":
                                            this.emit("notify_input_status_notice", new InputStatusEvent(data))
                                            break
                                    }
                                    break
                                case "group_ban":
                                    this.emit("group_ban_notice", new GroupBanEvent(data))
                                    break
                                case "friend_recall":
                                    this.emit("friend_recall_notice", new FriendRecallEvent(data))
                                    break
                                case "group_recall":
                                    this.emit("group_recall_notice", new GroupRecallEvent(data))
                                    break
                                case "group_admin":
                                    this.emit("group_admin_notice", new GroupAdminEvent(data))
                                    break
                                case "group_increase":
                                    this.emit("group_increase_notice", new GroupIncreaseEvent(data))
                                    break
                                case "group_decrease":
                                    this.emit("group_decrease_notice", new GroupDecreaseEvent(data))
                                    break
                                case "essence":
                                    this.emit("essence_notice", new EssenceEvent(data))
                                    break
                                case "group_upload":
                                    this.emit("group_upload_notice", new GroupUploadEvent(data))
                                    break
                                case "group_msg_emoji_like":
                                    this.emit("group_msg_emoji_like", new GroupMsgEmojiLike(data))
                                    break
                                case "friend_add":
                                    this.emit("friend_add_notice", new FriendAddEvent(data))
                                    break
                            }
                    }
                    return
                }
                let handler = this.handlers.shift()
                if (!handler) {
                    console.warn("unknown handler: ", data)
                    return
                }
                if (data.retcode != 0) {
                    // reject
                    handler.second(data)
                } else {
                    // solve
                    handler.first(data)
                }
            }
            this.emit("open", new OpenEvent({
                time: Date.now(),
                self_id: this.bot_id,
                post_type: "meta_event"
            }))
        }
    }

    /**
     * 获取 Bot 添加的所有群聊
     */
    get groups(): Promise<Group[]> {
        return new Promise((resolve, reject) => {
            let result: Group[] = []
            this.send(new Action("get_group_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                try {
                    for (let group of data.data) {
                        if (!group || !group.group_id) continue
                        result.push(new Group(group, this))
                    }
                } catch (e) {
                    resolve([])
                    console.error(e, data)
                }
                resolve(result)
            }).catch(reject)
        })
    }

    /**
     * 获取 Bot 的好友列表
     */
    get friends(): Promise<Friend[]> {
        return new Promise((resolve, reject) => {
            let result: Friend[] = []
            this.send(new Action("get_friend_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                for (let friend of data.data) {
                    result.push(new Friend(friend, this))
                }
                resolve(result)
            }).catch(reject)
        })
    }

    /**
     * 请求 OneBot 接口
     *
     * @param action 操作
     */
    send(action: Action): Promise<any> {
        this.ws.send(action.toString())
        return new Promise((resolve, reject) => {
            this.handlers.push(new Pair<any>(resolve, reject))
        })
    }

    /**
     * 发送群消息
     *
     * @param group_id 群号
     * @param messages 消息
     */
    sendGroupMessage(group_id: number, messages: any) {
        let group = new Group({
            group_id: group_id
        }, this)
        return group.sendMessage(messages)
    }

    /**
     * 注册事件监听器
     *
     * @param type 监听事件类型
     * @param listener 事件函数
     */
    on<K extends keyof EventMap>(
        type: K,
        listener: (event: EventMap[K]) => void
    ) {
        if (!this.listeners[type]) {
            this.listeners[type] = []
        }
        this.listeners[type]!.push(listener)
    }

    /**
     * 清除事件监听器
     *
     * @param type 类型
     */
    clearListener<K extends keyof EventMap>(
        type: K
    ) {
        this.listeners[type] = []
    }

    /**
     * 广播一个事件
     *
     * @param type 类型
     * @param event 事件对象
     */
    emit<K extends keyof EventMap>(type: K, event: EventMap[K]) {
        try {
            this._emit(type, event)
            this._emit("event", event)
            if (event instanceof GroupNoticeEvent) {
                this._emit("group_notice", event)
            }
        } catch (e) {
            console.error(`Error on${type}: ${e}`)
        }
    }

    private _emit<K extends keyof EventMap>(type: K, event: EventMap[K]) {
        for (let listener of this.listeners[type] || []) {
            listener(event)
            if (event.isStopped()) {
                break
            }
        }
    }

    /**
     * 撤回一条消息
     *
     * @param message_id 消息ID
     */
    recall(message_id: number) {
        return this.send(new Action("delete_msg", {
            message_id: message_id,
        }))
    }

    /**
     * 发送戳一戳消息
     *
     * @param user_id 目标用户ID
     * @param group_id 发送的群，若不存在则私聊发送
     */
    poke(user_id: number, group_id: number | undefined = undefined) {
        let params: any = {
            user_id: user_id
        }
        if (group_id) {
            params.group_id = group_id
        }
        return this.send(new Action("send_poke", params))
    }

    /**
     * 获取消息
     *
     * @param msg_id 消息ID
     */
    getMsg(msg_id: number) {
        return new Promise<MessageEvent>((resolve, reject) => {
            this.send(new Action("get_msg", {
                message_id: msg_id
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                if (!data.data) {
                    reject("data is null")
                    return
                }
                resolve(new MessageEvent(data.data))
            }).catch(reject)
        })
    }
}