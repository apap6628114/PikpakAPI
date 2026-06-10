/**
 * 云盘文件/文件夹信息
 */
interface DriveFile {
    kind: string;
    id: string;
    parent_id: string;
    name: string;
    user_id: string;
    size: string;
    revision: string;
    file_extension: string;
    mime_type: string;
    starred: boolean;
    web_content_link: string;
    created_time: string;
    modified_time: string;
    icon_link: string;
    thumbnail_link: string;
    md5_checksum: string;
    hash: string;
    links: {};
    phase: string;
    audit: null | any;
    medias: any[];
    trashed: boolean;
    delete_time: string;
    original_url: string;
    params: any[];
    original_file_index: number;
    space: string;
    apps: any[];
    writable: boolean;
    folder_type: string;
    collection?: null | any;
    sort_name: string;
    user_modified_time: string;
    spell_name: string[];
    file_category: string;
    tags: any[];
    reference_events: any[];
    reference_resource?: null | any;
}
/**
 * 文件列表响应
 */
interface FileList {
    kind: string;
    next_page_token: string;
    files: DriveFile[];
    version: string;
    version_outdated: boolean;
    sync_time: string;
}
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
/**
 * 云盘配额明细
 */
interface Quota {
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
        cloud_download?: Quota;
    };
    expires_at: string;
    user_type: number;
}
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
    result: string;
    message: string;
    redirect_uri: string;
    data: VipData;
}
/**
 * 传输配额明细
 */
interface TransferQuotaDetail {
    info: string;
    total_assets: number;
    assets: number;
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
/**
 * 事件中的引用资源（文件快照）
 */
interface ReferenceResource {
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
    kind: string;
    type: string;
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
