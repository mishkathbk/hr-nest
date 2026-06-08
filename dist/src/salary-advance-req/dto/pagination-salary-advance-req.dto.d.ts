export declare class SalaryAdvanceReqFilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationSalaryAdvanceReqDto {
    search?: string;
    filterList?: SalaryAdvanceReqFilterItemDto[];
    offset?: number;
    limit?: number;
}
