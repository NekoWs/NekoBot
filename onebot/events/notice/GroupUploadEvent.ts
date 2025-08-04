import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupUploadEvent extends GroupNoticeEvent {
    /**
     * 文件上传者 QQ 号
     */
    readonly user_id: number

    /**
     * 上传的文件信息
     */
    readonly file: File

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.file = new File(payload.file)
    }
}

class File {
    /**
     * 文件 ID
     */
    readonly id: string

    /**
     * 文件名
     */
    readonly name: string

    /**
     * 文件大小
     */
    readonly size: number

    /**
     * 尚不明确
     */
    readonly busid: number

    constructor(payload: any) {
        this.id = payload.id
        this.name = payload.name
        this.size = payload.size
        this.busid = payload.busid
    }
}