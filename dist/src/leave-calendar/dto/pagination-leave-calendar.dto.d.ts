export declare class FilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationLeaveCalendarDto {
    search?: string;
    filterList?: FilterItemDto[];
    offset?: number;
    limit?: number;
}
