"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const Message_1 = require("../Message");
class Image extends Message_1.Message {
    constructor(file, summary) {
        super({
            type: "image",
            data: {
                file: file,
                summary: summary
            }
        });
    }
}
exports.Image = Image;
