"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const Message_1 = require("../Message");
class File extends Message_1.Message {
    constructor(file, name) {
        super({
            type: "file",
            data: {
                file: file,
                name: name
            }
        });
    }
}
exports.File = File;
