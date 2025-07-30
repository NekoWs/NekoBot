import {Message} from "../Message";

export class Reply extends Message {
    constructor(message_id: number) {
        super({
            type: "reply",
            data: { id: message_id }
        });
    }
}