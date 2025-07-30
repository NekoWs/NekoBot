import {Message} from "../Message";

export class Image extends Message {
    constructor(file: string, summary: string) {
        super({
            type: "image",
            data: {
                file: file,
                summary: summary
            }
        });
    }
}