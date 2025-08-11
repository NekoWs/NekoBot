"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.bots = void 0;
const Action_1 = require("./utils/Action");
const MessageEvent_1 = require("./events/MessageEvent");
const PrivateMessageEvent_1 = require("./events/PrivateMessageEvent");
const Group_1 = require("./contact/Group");
const Friend_1 = require("./contact/Friend");
const NoticeEvent_1 = require("./events/notice/NoticeEvent");
const PokeEvent_1 = require("./events/notice/PokeEvent");
const GroupMessageEvent_1 = require("./events/GroupMessageEvent");
const FiendRecallEvent_1 = require("./events/notice/FiendRecallEvent");
const GroupRecallEvent_1 = require("./events/notice/GroupRecallEvent");
const GroupBanEvent_1 = require("./events/notice/GroupBanEvent");
const OpenEvent_1 = require("./events/OpenEvent");
const HeartBeatEvent_1 = require("./events/HeartBeatEvent");
const LifeCycleEvent_1 = require("./events/LifeCycleEvent");
const GroupAdminEvent_1 = require("./events/notice/GroupAdminEvent");
const GroupIncreaseEvent_1 = require("./events/notice/GroupIncreaseEvent");
const GroupNameEvent_1 = require("./events/notice/GroupNameEvent");
const GroupNoticeEvent_1 = require("./events/notice/GroupNoticeEvent");
const GroupDecreaseEvent_1 = require("./events/notice/GroupDecreaseEvent");
const EssenceEvent_1 = require("./events/notice/EssenceEvent");
const GroupTitleEvent_1 = require("./events/notice/GroupTitleEvent");
const ProfileLikeEvent_1 = require("./events/notice/ProfileLikeEvent");
const GroupUploadEvent_1 = require("./events/notice/GroupUploadEvent");
const GroupMsgEmojiLikeEvent_1 = require("./events/notice/GroupMsgEmojiLikeEvent");
const FriendAddEvent_1 = require("./events/notice/FriendAddEvent");
const InputStatusEvent_1 = require("./events/notice/InputStatusEvent");
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
exports.bots = new Map();
class Client {
    /**
     * OneBot 客户端
     *
     * @param host WebSocket 服务器地址
     * @param port 端口
     * @param token Token
     */
    constructor(host, port, token) {
        this.bot_id = -1;
        this.handlers = [];
        this.listeners = {};
        this.ws = new WebSocket(`ws://${host}:${port}/?access_token=${token}`);
        this.ws.onerror = (e) => {
            throw e;
        };
        this.ws.onopen = () => {
            this.ws.onmessage = event => {
                let data = JSON.parse(event.data);
                if (data.post_type) {
                    switch (data.post_type) {
                        case "meta_event":
                            switch (data.meta_event_type) {
                                case "lifecycle":
                                    this.emit("lifecycle", new LifeCycleEvent_1.LifeCycleEvent(data));
                                    exports.bots.set(data.self_id, this);
                                    this.bot_id = data.self_id;
                                    break;
                                case "heartbeat":
                                    this.emit("heartbeat", new HeartBeatEvent_1.HeartBeatEvent(data));
                                    break;
                            }
                            break;
                        case "message":
                            let event;
                            switch (data.message_type) {
                                case "group":
                                    event = new GroupMessageEvent_1.GroupMessageEvent(data);
                                    this.emit("group_message", event);
                                    break;
                                case "private":
                                    event = new PrivateMessageEvent_1.PrivateMessageEvent(data);
                                    this.emit("private_message", event);
                                    break;
                                default: // other?
                                    event = new MessageEvent_1.MessageEvent(data);
                                    break;
                            }
                            this.emit("message", event);
                            break;
                        case "message_sent":
                            // TODO: 用途不明，暂时不需要
                            break;
                        case "request":
                            // TODO: 暂时无法测试
                            break;
                        case "notice":
                            this.emit("notice", new NoticeEvent_1.NoticeEvent(data));
                            switch (data.notice_type) {
                                case "notify":
                                    switch (data.sub_type) {
                                        case "poke":
                                            this.emit("notify_poke_notice", new PokeEvent_1.PokeEvent(data));
                                            break;
                                        case "group_name":
                                            this.emit("notify_group_name_notice", new GroupNameEvent_1.GroupNameEvent(data));
                                            break;
                                        case "title":
                                            this.emit("notify_title_notice", new GroupTitleEvent_1.GroupTitleEvent(data));
                                            break;
                                        case "profile_like":
                                            this.emit("notify_profile_like_notice", new ProfileLikeEvent_1.ProfileLikeEvent(data));
                                            break;
                                        case "input_status":
                                            this.emit("notify_input_status_notice", new InputStatusEvent_1.InputStatusEvent(data));
                                            break;
                                    }
                                    break;
                                case "group_ban":
                                    this.emit("group_ban_notice", new GroupBanEvent_1.GroupBanEvent(data));
                                    break;
                                case "friend_recall":
                                    this.emit("friend_recall_notice", new FiendRecallEvent_1.FriendRecallEvent(data));
                                    break;
                                case "group_recall":
                                    this.emit("group_recall_notice", new GroupRecallEvent_1.GroupRecallEvent(data));
                                    break;
                                case "group_admin":
                                    this.emit("group_admin_notice", new GroupAdminEvent_1.GroupAdminEvent(data));
                                    break;
                                case "group_increase":
                                    this.emit("group_increase_notice", new GroupIncreaseEvent_1.GroupIncreaseEvent(data));
                                    break;
                                case "group_decrease":
                                    this.emit("group_decrease_notice", new GroupDecreaseEvent_1.GroupDecreaseEvent(data));
                                    break;
                                case "essence":
                                    this.emit("essence_notice", new EssenceEvent_1.EssenceEvent(data));
                                    break;
                                case "group_upload":
                                    this.emit("group_upload_notice", new GroupUploadEvent_1.GroupUploadEvent(data));
                                    break;
                                case "group_msg_emoji_like":
                                    this.emit("group_msg_emoji_like", new GroupMsgEmojiLikeEvent_1.GroupMsgEmojiLikeEvent(data));
                                    break;
                                case "friend_add":
                                    this.emit("friend_add_notice", new FriendAddEvent_1.FriendAddEvent(data));
                                    break;
                            }
                    }
                    return;
                }
                let handler = this.handlers.shift();
                if (!handler) {
                    console.warn("unknown handler: ", data);
                    return;
                }
                if (data.retcode != 0) {
                    // reject
                    handler.second(data);
                }
                else {
                    // solve
                    handler.first(data);
                }
            };
            this.emit("open", new OpenEvent_1.OpenEvent({
                time: Date.now(),
                self_id: this.bot_id,
                post_type: "meta_event"
            }));
        };
    }
    /**
     * 获取 Bot 添加的所有群聊
     */
    get groups() {
        return new Promise((resolve, reject) => {
            let result = [];
            this.send(new Action_1.Action("get_group_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                try {
                    for (let group of data.data) {
                        if (!group || !group.group_id)
                            continue;
                        result.push(new Group_1.Group(group, this));
                    }
                }
                catch (e) {
                    resolve([]);
                    console.error(e, data);
                }
                resolve(result);
            }).catch(reject);
        });
    }
    /**
     * 获取 Bot 的好友列表
     */
    get friends() {
        return new Promise((resolve, reject) => {
            let result = [];
            this.send(new Action_1.Action("get_friend_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                for (let friend of data.data) {
                    result.push(new Friend_1.Friend(friend, this));
                }
                resolve(result);
            }).catch(reject);
        });
    }
    /**
     * 请求 OneBot 接口
     *
     * @param action 操作
     */
    send(action) {
        this.ws.send(action.toString());
        return new Promise((resolve, reject) => {
            this.handlers.push(new Pair(resolve, reject));
        });
    }
    /**
     * 发送群消息
     *
     * @param group_id 群号
     * @param messages 消息
     */
    sendGroupMessage(group_id, messages) {
        let group = new Group_1.Group({
            group_id: group_id
        }, this);
        return group.sendMessage(messages);
    }
    /**
     * 注册事件监听器
     *
     * @param type 监听事件类型
     * @param listener 事件函数
     */
    on(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    }
    /**
     * 清除事件监听器
     *
     * @param type 类型
     */
    clearListener(type) {
        this.listeners[type] = [];
    }
    /**
     * 广播一个事件
     *
     * @param type 类型
     * @param event 事件对象
     */
    emit(type, event) {
        try {
            this._emit(type, event);
            this._emit("event", event);
            if (event instanceof GroupNoticeEvent_1.GroupNoticeEvent) {
                this._emit("group_notice", event);
            }
        }
        catch (e) {
            console.error(`Error on${type}: ${e}`);
        }
    }
    _emit(type, event) {
        for (let listener of this.listeners[type] || []) {
            listener(event);
            if (event.isStopped()) {
                break;
            }
        }
    }
    /**
     * 撤回一条消息
     *
     * @param message_id 消息ID
     */
    recall(message_id) {
        return this.send(new Action_1.Action("delete_msg", {
            message_id: message_id,
        }));
    }
    /**
     * 发送戳一戳消息
     *
     * @param user_id 目标用户ID
     * @param group_id 发送的群，若不存在则私聊发送
     */
    poke(user_id, group_id = undefined) {
        let params = {
            user_id: user_id
        };
        if (group_id) {
            params.group_id = group_id;
        }
        return this.send(new Action_1.Action("send_poke", params));
    }
    /**
     * 获取消息
     *
     * @param msg_id 消息ID
     */
    getMsg(msg_id) {
        return new Promise((resolve, reject) => {
            this.send(new Action_1.Action("get_msg", {
                message_id: msg_id
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                if (!data.data) {
                    reject("data is null");
                    return;
                }
                resolve(new MessageEvent_1.MessageEvent(data.data));
            }).catch(reject);
        });
    }
    /**
     * 获取群
     *
     * @param group_id 群号
     */
    async getGroup(group_id) {
        return new Promise((resolve, reject) => {
            this.send(new Action_1.Action("get_group_info", {
                group_id: group_id,
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                if (!data.data) {
                    reject(data.message);
                    return;
                }
                resolve(new Group_1.Group(data.data, this));
            }).catch(reject);
        });
    }
}
exports.Client = Client;
