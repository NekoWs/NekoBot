"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const Message_1 = require("../Message");
class Video extends Message_1.Message {
    constructor(file) {
        super({
            type: "video",
            data: {
                file: file
            }
        });
    }
}
exports.Video = Video;
