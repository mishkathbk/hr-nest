export declare class SalaryCertificateReqFilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationSalaryCertificateReqDto {
    search?: string;
    filterList?: SalaryCertificateReqFilterItemDto[];
    offset?: number;
    limit?: number;
}
