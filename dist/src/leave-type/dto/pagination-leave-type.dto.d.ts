export declare class FilterItemDto {
    field: string;
    value: string;
    condition?: number;
}
export declare class PaginationLeaveTypeDto {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isDescending?: boolean;
    filters?: FilterItemDto[];
}
