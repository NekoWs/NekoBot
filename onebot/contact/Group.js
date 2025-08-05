"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const Action_1 = require("../utils/Action");
const MessageChain_1 = require("../message/MessageChain");
const MessageBuilder_1 = require("../message/MessageBuilder");
const Member_1 = require("./Member");
class Group {
    /**
     * 获取群成员列表
     */
    get members() {
        return new Promise((resolve, reject) => {
            let members = [];
            this.client.send(new Action_1.Action("get_group_member_list", {
                group_id: this.group_id,
            })).then(data => {
                for (let member of data) {
                    members.push(new Member_1.Member(member, this.client));
                }
            }).catch(reject);
            resolve(members);
        });
    }
    /**
     * 获取成员
     *
     * @param user_id 用户 ID
     * @param no_cache 是否禁用缓存
     */
    async getMember(user_id, no_cache = false) {
        return this.client.send(new Action_1.Action("get_group_member_info", {
            group_id: this.group_id,
            user_id: user_id,
            no_cache: no_cache
        })).then(data => {
            if (data.retcode !== 0) {
                throw new Error(data.message);
            }
            return new Member_1.Member(data.data, this.client);
        });
    }
    /**
     * 发送群消息
     *
     * @param message 消息
     */
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            let msg;
            if (message instanceof MessageChain_1.MessageChain) {
                msg = message;
            }
            else {
                let mb = new MessageBuilder_1.MessageBuilder();
                msg = mb.append(message).build();
            }
            this.client.send(new Action_1.Action("send_msg", {
                group_id: this.group_id,
                message: msg.toJson(),
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                resolve(data.data.message_id);
            }).catch(reject);
        });
    }
    constructor(payload, client) {
        this.group_id = payload.group_id;
        this.group_name = payload.group_name;
        this.member_count = payload.member_count;
        this.max_member_count = payload.max_member_count;
        this.client = client;
    }
}
exports.Group = Group;
