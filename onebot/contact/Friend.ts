import {Client} from "../OneBot";
import {Contact} from "./Contact";

export class Friend extends Contact {
    readonly birthday_year: number
    readonly birthday_month: number
    readonly birthday_day: number
    readonly age: number
    readonly phone_num: string
    readonly email: string
    readonly category_id: number
    readonly sex: string
    readonly level: number
    readonly remark: string

    constructor(payload: any, client: Client) {
        super(payload, client)
        this.birthday_year = payload.birthday_year
        this.birthday_month = payload.birthday_month
        this.birthday_day = payload.birthday_day
        this.age = payload.age
        this.phone_num = payload.phone_num
        this.email = payload.email
        this.category_id = payload.category_id
        this.sex = payload.sex
        this.level = payload.level
        this.remark = payload.remark;
    }
}