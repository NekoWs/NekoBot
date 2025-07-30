import {Message} from "../Message";

export class At extends Message {
    constructor(user_id: number) {
        super({
            type: "at",
            data: { qq: user_id }
        });
    }
}