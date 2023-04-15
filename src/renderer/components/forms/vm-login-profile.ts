export interface VMLoginProfiles {
    data: VMLoginProfile[];
    paging: VMLoginPaging;
}

export interface VMLoginProfile {
    createTime: number;
    lastUsedTime: number;
    name: string;
    sid: string;
    tag: string;
}

export interface VMLoginPaging {
    currentPage: number;
    totalCount: number;
}