import {Message} from "../Message";

export class Video extends Message {
    constructor(file: string) {
        super({
            type: "video",
            data: {
                file: file
            }
        });
    }
}