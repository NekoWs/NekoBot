import {Message} from "../Message";

export class Record extends Message {
    constructor(file: string) {
        super({
            type: "record",
            data: {
                file: file
            }
        });
    }
}