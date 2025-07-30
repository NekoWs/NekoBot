"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friend = void 0;
const Contact_1 = require("./Contact");
class Friend extends Contact_1.Contact {
    constructor(payload, client) {
        super(payload, client);
        this.birthday_year = payload.birthday_year;
        this.birthday_month = payload.birthday_month;
        this.birthday_day = payload.birthday_day;
        this.age = payload.age;
        this.phone_num = payload.phone_num;
        this.email = payload.email;
        this.category_id = payload.category_id;
        this.sex = payload.sex;
        this.level = payload.level;
        this.remark = payload.remark;
    }
}
exports.Friend = Friend;
