/**
 * 枚举下载状态
 */
export declare enum DownloadStatus {
    /** 未下载 */
    NotDownloading = "not_downloading",
    /** 下载中 */
    Downloading = "downloading",
    /** 下载完成 */
    Done = "done",
    /** 下载出错 */
    Error = "error",
    /** 资源未找到 */
    NotFound = "not_found"
}
/** 文件/任务生命周期阶段状态 */
export declare enum FilePhase {
    /** 已完成 */
    Complete = "PHASE_TYPE_COMPLETE",
    /** 运行中 */
    Running = "PHASE_TYPE_RUNNING",
    /** 出错 */
    Error = "PHASE_TYPE_ERROR",
    /** 等待中 */
    Pending = "PHASE_TYPE_PENDING"
}
/** 文件审计状态 */
export declare enum AuditStatus {
    /** 正常 */
    Ok = "STATUS_OK"
}
/** 驱动资源类型标识（kind 字段） */
export declare enum DriveKind {
    /** 文件夹 */
    Folder = "drive#folder",
    /** 文件 */
    File = "drive#file",
    /** 文件列表 */
    FileList = "drive#fileList",
    /** 事件 */
    Event = "drive#event",
    /** 离线下载任务 */
    Task = "drive#task",
    /** 云盘信息 */
    About = "drive#about",
    /** 配额 */
    Quota = "drive#quota"
}
/** 文件夹类型 */
export declare enum FolderType {
    /** 普通文件夹 */
    Normal = "NORMAL",
    /** 下载文件夹（来自离线下载） */
    Download = "DOWNLOAD"
}
/** 文件分类 */
export declare enum FileCategory {
    /** 未分类 */
    Other = "OTHER",
    /** 视频 */
    Video = "VIDEO",
    /** 音频 */
    Audio = "AUDIO",
    /** 图片 */
    Image = "IMAGE",
    /** 文档 */
    Document = "DOCUMENT"
}
/** 上传类型 */
export declare enum UploadType {
    /** 未知上传类型（新创建的文件夹/文件） */
    Unknown = "UPLOAD_TYPE_UNKNOWN"
}
/** VIP 订阅状态 */
export declare enum VipStatus {
    /** 正常 */
    Ok = "ok"
}
/** VIP 会员类型 */
export declare enum VipType {
    /** 白金会员 */
    Platinum = "platinum"
}
/** 事件操作类型 */
export declare enum EventType {
    /** 恢复/添加 */
    Restore = "TYPE_RESTORE",
    /** 创建 */
    Create = "TYPE_CREATE",
    /** 修改 */
    Update = "TYPE_UPDATE",
    /** 移动 */
    Move = "TYPE_MOVE",
    /** 复制 */
    Copy = "TYPE_COPY",
    /** 删除 */
    Delete = "TYPE_DELETE",
    /** 回收 */
    Trash = "TYPE_TRASH"
}
