"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Record = void 0;
const Message_1 = require("../Message");
class Record extends Message_1.Message {
    constructor(file) {
        super({
            type: "record",
            data: {
                file: file
            }
        });
    }
}
exports.Record = Record;
