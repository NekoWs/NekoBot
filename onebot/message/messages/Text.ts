import {Message} from "../Message";

export class Text extends Message {
    constructor(message: string) {
        super({
            type: "text",
            data: { text: message }
        });
    }
}