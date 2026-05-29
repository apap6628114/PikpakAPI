interface file {
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
    medias: [];
    trashed: boolean;
    delete_time: string;
    original_url: string;
    params: any[];
    original_file_index: number;
    space: string;
    apps: [];
    writable: boolean;
    folder_type: string;
    collection: null | any;
    sort_name: string;
    user_modified_time: string;
    spell_name: string[];
    file_category: string;
    tags: [];
    reference_events: [];
    reference_resource: null | any;
}
interface FileList {
    kind: string;
    next_page_token: string;
    files: file[];
    version: string;
    version_outdated: boolean;
    sync_time: string;
}
interface TokenData {
    access_token: string;
    refresh_token: string;
}
interface FileRecord {
    id: string;
    name: string;
    fileType: string;
}
