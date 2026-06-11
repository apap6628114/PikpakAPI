"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.VipType = exports.VipStatus = exports.UploadType = exports.FileCategory = exports.FolderType = exports.DriveKind = exports.AuditStatus = exports.FilePhase = exports.DownloadStatus = void 0;
/**
 * 枚举下载状态
 */
var DownloadStatus;
(function (DownloadStatus) {
    /** 未下载 */
    DownloadStatus["NotDownloading"] = "not_downloading";
    /** 下载中 */
    DownloadStatus["Downloading"] = "downloading";
    /** 下载完成 */
    DownloadStatus["Done"] = "done";
    /** 下载出错 */
    DownloadStatus["Error"] = "error";
    /** 资源未找到 */
    DownloadStatus["NotFound"] = "not_found";
})(DownloadStatus || (exports.DownloadStatus = DownloadStatus = {}));
// ============================================================
// 文件/任务阶段状态
// ============================================================
/** 文件/任务生命周期阶段状态 */
var FilePhase;
(function (FilePhase) {
    /** 已完成 */
    FilePhase["Complete"] = "PHASE_TYPE_COMPLETE";
    /** 运行中 */
    FilePhase["Running"] = "PHASE_TYPE_RUNNING";
    /** 出错 */
    FilePhase["Error"] = "PHASE_TYPE_ERROR";
    /** 等待中 */
    FilePhase["Pending"] = "PHASE_TYPE_PENDING";
})(FilePhase || (exports.FilePhase = FilePhase = {}));
// ============================================================
// 审计状态
// ============================================================
/** 文件审计状态 */
var AuditStatus;
(function (AuditStatus) {
    /** 正常 */
    AuditStatus["Ok"] = "STATUS_OK";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
// ============================================================
// 驱动资源类型标识
// ============================================================
/** 驱动资源类型标识（kind 字段） */
var DriveKind;
(function (DriveKind) {
    /** 文件夹 */
    DriveKind["Folder"] = "drive#folder";
    /** 文件 */
    DriveKind["File"] = "drive#file";
    /** 文件列表 */
    DriveKind["FileList"] = "drive#fileList";
    /** 事件 */
    DriveKind["Event"] = "drive#event";
    /** 离线下载任务 */
    DriveKind["Task"] = "drive#task";
    /** 云盘信息 */
    DriveKind["About"] = "drive#about";
    /** 配额 */
    DriveKind["Quota"] = "drive#quota";
})(DriveKind || (exports.DriveKind = DriveKind = {}));
// ============================================================
// 文件夹/文件属性
// ============================================================
/** 文件夹类型 */
var FolderType;
(function (FolderType) {
    /** 普通文件夹 */
    FolderType["Normal"] = "NORMAL";
    /** 下载文件夹（来自离线下载） */
    FolderType["Download"] = "DOWNLOAD";
})(FolderType || (exports.FolderType = FolderType = {}));
/** 文件分类 */
var FileCategory;
(function (FileCategory) {
    /** 未分类 */
    FileCategory["Other"] = "OTHER";
    /** 视频 */
    FileCategory["Video"] = "VIDEO";
    /** 音频 */
    FileCategory["Audio"] = "AUDIO";
    /** 图片 */
    FileCategory["Image"] = "IMAGE";
    /** 文档 */
    FileCategory["Document"] = "DOCUMENT";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
/** 上传类型 */
var UploadType;
(function (UploadType) {
    /** 未知上传类型（新创建的文件夹/文件） */
    UploadType["Unknown"] = "UPLOAD_TYPE_UNKNOWN";
})(UploadType || (exports.UploadType = UploadType = {}));
// ============================================================
// VIP/订阅
// ============================================================
/** VIP 订阅状态 */
var VipStatus;
(function (VipStatus) {
    /** 正常 */
    VipStatus["Ok"] = "ok";
})(VipStatus || (exports.VipStatus = VipStatus = {}));
/** VIP 会员类型 */
var VipType;
(function (VipType) {
    /** 白金会员 */
    VipType["Platinum"] = "platinum";
})(VipType || (exports.VipType = VipType = {}));
// ============================================================
// 事件
// ============================================================
/** 事件操作类型 */
var EventType;
(function (EventType) {
    /** 恢复/添加 */
    EventType["Restore"] = "TYPE_RESTORE";
    /** 创建 */
    EventType["Create"] = "TYPE_CREATE";
    /** 修改 */
    EventType["Update"] = "TYPE_UPDATE";
    /** 移动 */
    EventType["Move"] = "TYPE_MOVE";
    /** 复制 */
    EventType["Copy"] = "TYPE_COPY";
    /** 删除 */
    EventType["Delete"] = "TYPE_DELETE";
    /** 回收 */
    EventType["Trash"] = "TYPE_TRASH";
})(EventType || (exports.EventType = EventType = {}));
