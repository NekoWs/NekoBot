import {Message} from "../Message";

export class Face extends Message {
    constructor(face_id: number) {
        super({
            type: "face",
            data: { id: face_id }
        });
    }
}