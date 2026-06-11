// ============================================================
// 文件/文件夹基础类型
// ============================================================

/**
 * 云盘文件/文件夹信息
 */
interface DriveFile {
    /** 文件类型，例如 "drive#folder" 表示文件夹 */
    kind: string;
    /** 文件 ID */
    id: string;
    /** 父文件夹 ID，根目录为 "" */
    parent_id: string;
    /** 文件名 */
    name: string;
    /** 用户 ID */
    user_id: string;
    /** 文件大小（字节），使用 string 类型避免大数精度丢失 */
    size: string;
    /** 文件版本号 */
    revision: string;
    /** 文件扩展名 */
    file_extension: string;
    /** 文件 MIME 类型 */
    mime_type: string;
    /** 是否收藏 */
    starred: boolean;
    /** 文件 Web 内容链接 */
    web_content_link: string;
    /** 创建时间（ISO 8601 格式） */
    created_time: string;
    /** 修改时间（ISO 8601 格式） */
    modified_time: string;
    /** 文件图标链接 */
    icon_link: string;
    /** 文件缩略图链接 */
    thumbnail_link: string;
    /** 文件 MD5 校验和 */
    md5_checksum: string;
    /** 文件哈希值 */
    hash: string;
    /** 文件链接信息 */
    links: {};
    /** 文件状态，例如 "PHASE_TYPE_COMPLETE" 表示已完成 */
    phase: string;
    /** 文件审计信息 */
    audit: null | any;
    /** 文件媒体信息 */
    medias: any[];
    /** 是否在回收站中 */
    trashed: boolean;
    /** 删除时间（ISO 8601 格式） */
    delete_time: string;
    /** 文件原始链接 */
    original_url: string;
    /** 文件参数信息 */
    params: any[];
    /** 文件原始索引 */
    original_file_index: number;
    /** 文件空间信息 */
    space: string;
    /** 文件应用信息 */
    apps: any[];
    /** 是否可写 */
    writable: boolean;
    /** 文件夹类型，例如 "DOWNLOAD" 表示下载文件夹 */
    folder_type: string;
    /** 文件集合信息（非必需字段） */
    collection?: null | any;
    /** 文件排序名称 */
    sort_name: string;
    /** 用户修改时间（ISO 8601 格式） */
    user_modified_time: string;
    /** 文件拼写名称 */
    spell_name: string[];
    /** 文件分类，例如 "OTHER" 表示其他 */
    file_category: string;
    /** 文件标签信息 */
    tags: any[];
    /** 文件引用事件信息 */
    reference_events: any[];
    /** 文件引用资源信息（非必需字段） */
    reference_resource?: null | any;
}

/**
 * 文件列表响应
 */
interface FileList {
    /** 列表类型，例如 "drive#fileList" */
    kind: string;
    /** 下一页的令牌，最后一页为空字符串 */
    next_page_token: string;
    /** 文件列表 */
    files: DriveFile[];
    /** 版本信息 */
    version: string;
    /** 版本是否过时 */
    version_outdated: boolean;
    /** 同步时间（ISO 8601 格式） */
    sync_time: string;
}

// ============================================================
// 认证相关
// ============================================================

/**
 * 令牌数据（用于序列化/反序列化）
 */
interface TokenData {
    access_token: string;
    refresh_token: string;
}

/**
 * 文件路径缓存记录
 */
interface FileRecord {
    id: string;
    name: string;
    fileType: string;
}

// ============================================================
// 配额/用量 (drive/v1/about)
// ============================================================

/**
 * 云盘配额明细
 */
interface Quota {
    /** 配额类型，固定为 "drive#quota" */
    kind: string;
    /** 总上限（字节），使用 string 而非 number 以避免大数精度丢失 */
    limit: string;
    /** 已用量（字节），使用 string 而非 number 以避免大数精度丢失 */
    usage: string;
    /** 回收站占用（字节） */
    usage_in_trash: string;
    /** 是否无限容量 */
    is_unlimited: boolean;
    /** 赠送容量 */
    complimentary: string;
}

/**
 * drive/v1/about 响应 — 云盘空间配额信息
 */
interface AboutResponse {
    kind: "drive#about";
    quota: Quota;
    quotas: {
        /** 云下载配额 */
        cloud_download?: Quota;
    };
    expires_at: string;
    /** 用户类型 */
    user_type: number;
}

// ============================================================
// VIP 信息 (drive/v1/privilege/vip)
// ============================================================

/**
 * VIP 数据明细
 */
interface VipData {
    /** 过期时间，ISO 8601 格式 */
    expire: string;
    /** VIP 状态，已知值: "ok" */
    status: string;
    /** VIP 类型，已知值: "platinum"（白金会员） */
    type: string;
    user_id: string;
}

/**
 * drive/v1/privilege/vip 响应 — VIP 信息
 */
interface VipResponse {
    /** 处理结果，如 "ACCEPTED" */
    result: string;
    message: string;
    redirect_uri: string;
    data: VipData;
}

// ============================================================
// 传输配额 (vip/v1/quantity/list?type=transfer)
// ============================================================

/**
 * 传输配额明细
 */
interface TransferQuotaDetail {
    info: string;
    /** 总配额 */
    total_assets: number;
    /** 已使用配额 */
    assets: number;
    /** 大小（字节），部分场景下存在 */
    size?: number;
}

/**
 * 传输配额基础信息
 */
interface TransferQuotaBase {
    user_id: string;
    info: string;
    sub_status: boolean;
    vip_status: string;
    expire_time: string;
    /** 可读的配额总量，如 "10T" */
    assets: string;
    size: number;
    offline: TransferQuotaDetail;
    download: TransferQuotaDetail;
    upload: TransferQuotaDetail;
    download_daily: TransferQuotaDetail;
}

/**
 * vip/v1/quantity/list?type=transfer 响应 — 传输配额信息
 */
interface TransferQuotaResponse {
    transfer: {
        offline: TransferQuotaDetail;
        download: TransferQuotaDetail;
        upload: TransferQuotaDetail;
    };
    data: null | Record<string, unknown>;
    has_more: boolean;
    base: TransferQuotaBase;
}

// ============================================================
// 事件 (drive/v1/events)
// ============================================================

/**
 * 事件中的引用资源（文件快照）
 */
interface ReferenceResource {
    /** 资源类型标识，固定为 "type.googleapis.com/drive.ReferenceFile" */
    "@type": string;
    kind: string;
    id: string;
    parent_id: string;
    name: string;
    size: string;
    mime_type: string;
    icon_link: string;
    hash: string;
    phase: string;
    audit: {
        status: string;
        message: string;
        title: string;
    };
    thumbnail_link: string;
    params: Record<string, string>;
    space: string;
    medias: any[];
    starred: boolean;
    tags: any[];
    created_time: string;
    modified_time: string;
}

/**
 * 事件项
 */
interface EventItem {
    /** 事件类型，固定为 "drive#event" */
    kind: string;
    /** 事件分类，如 "TYPE_RESTORE" */
    type: string;
    /** 事件分类名称，如 "Add" */
    type_name: string;
    source: string;
    subject: string;
    device: string;
    id: string;
    created_time: string;
    mime_type: string;
    file_id: string;
    file_name: string;
    icon_url: string;
    params: Record<string, any>;
    updated_time: string;
    folder_id: string;
    label: string;
    progress: number;
    reference_resource?: ReferenceResource;
    space: string;
}

/**
 * drive/v1/events 响应 — 最近活动事件列表
 */
interface EventsResponse {
    next_page_token: string;
    events: EventItem[];
}

// ============================================================
// 任务 (drive/v1/tasks)
// ============================================================

/**
 * 离线下载任务项
 */
interface TaskItem {
    kind: string;
    id: string;
    name: string;
    /** 任务类型，固定为 "offline" */
    type: string;
    /** 任务状态: "PHASE_TYPE_RUNNING" | "PHASE_TYPE_ERROR" | "PHASE_TYPE_COMPLETE" | "PHASE_TYPE_PENDING" */
    phase: string;
    /** 下载进度（0-100） */
    progress: number;
    file_id: string;
    file_size: string;
    /** 状态描述信息，错误时包含错误原因 */
    message: string;
    params: Record<string, unknown>;
    reference_resource?: unknown;
}

/**
 * drive/v1/tasks 响应 — 任务列表
 */
interface TaskListResponse {
    tasks: TaskItem[];
    next_page_token: string;
    expires_in?: number;
}
