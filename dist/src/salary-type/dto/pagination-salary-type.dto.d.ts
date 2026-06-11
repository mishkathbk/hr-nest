export declare class FilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationSalaryTypeDto {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isDescending?: boolean;
    filters?: FilterItemDto[];
}
