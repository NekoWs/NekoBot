"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Face = void 0;
const Message_1 = require("../Message");
class Face extends Message_1.Message {
    constructor(face_id) {
        super({
            type: "face",
            data: { id: face_id }
        });
    }
}
exports.Face = Face;
