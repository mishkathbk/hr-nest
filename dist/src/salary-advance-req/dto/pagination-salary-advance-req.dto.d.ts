export declare class FilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationSalaryAdvanceReqDto {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isDescending?: boolean;
    filters?: FilterItemDto[];
}
