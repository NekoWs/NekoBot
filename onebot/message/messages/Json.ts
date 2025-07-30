import {Message} from "../Message";

export class Json extends Message {
    constructor(data: string) {
        super({
            type: "json",
            data: { data: data }
        });
    }
}