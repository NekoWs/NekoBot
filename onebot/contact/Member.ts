import {Client} from "../OneBot";
import {Contact} from "./Contact";

export class Member extends Contact {
    readonly group_id: number
    readonly card: string
    readonly sex: string
    readonly age: number
    readonly area: string
    readonly join_time: number
    readonly last_sent_time: number
    readonly level: string
    readonly role: string
    readonly unfriendly: boolean
    readonly title: string
    readonly title_expire_time: number
    readonly card_changeable: boolean

    constructor(payload: any, client: Client) {
        super(payload, client)
        this.group_id = payload.group_id
        this.card = payload.card
        this.sex = payload.sex
        this.age = payload.age
        this.area = payload.area
        this.join_time = payload.join_time
        this.last_sent_time = payload.last_sent_time
        this.level = payload.level
        this.role = payload.role
        this.unfriendly = payload.unfriendly
        this.title = payload.title
        this.title_expire_time = payload.title_expire_time
        this.card_changeable = payload.card_changeable
    }
}