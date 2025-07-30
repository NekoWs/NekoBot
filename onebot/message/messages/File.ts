import {Message} from "../Message";

export class File extends Message {
    constructor(file: string, name: string) {
        super({
            type: "file",
            data: {
                file: file,
                name: name
            }
        });
    }
}