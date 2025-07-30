"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const Contact_1 = require("./Contact");
class Member extends Contact_1.Contact {
    constructor(payload, client) {
        super(payload, client);
        this.group_id = payload.group_id;
        this.card = payload.card;
        this.sex = payload.sex;
        this.age = payload.age;
        this.area = payload.area;
        this.join_time = payload.join_time;
        this.last_sent_time = payload.last_sent_time;
        this.level = payload.level;
        this.role = payload.role;
        this.unfriendly = payload.unfriendly;
        this.title = payload.title;
        this.title_expire_time = payload.title_expire_time;
        this.card_changeable = payload.card_changeable;
    }
}
exports.Member = Member;
