"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sender = void 0;
/**
 * 消息发送者对象
 */
class Sender {
    /**
     * 转换为群成员
     *
     * @param group 群
     * @param no_cache 不使用缓存
     */
    asMember(group_1) {
        return __awaiter(this, arguments, void 0, function* (group, no_cache = false) {
            return group.getMember(this.user_id, no_cache);
        });
    }
    /**
     * 转换为好友
     *
     * @param client 客户端
     */
    asFriend(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return client.friends.then(friends => {
                for (const friend of friends) {
                    if (friend.user_id == this.user_id) {
                        return friend;
                    }
                }
                throw new Error("friend not found");
            });
        });
    }
    constructor(payload) {
        this.user_id = payload.user_id;
        this.nickname = payload.nickname;
        this.card = payload.card;
        this.role = payload.role;
    }
}
exports.Sender = Sender;
