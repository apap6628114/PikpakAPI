"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadStatus = void 0;
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
