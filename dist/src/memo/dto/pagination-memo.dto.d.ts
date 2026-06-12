export declare class FilterItemDto {
    field: string;
    value: string;
    condition?: number;
}
export declare class PaginationMemoDto {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isDescending?: boolean;
    filters?: FilterItemDto[];
}
