export declare class PolicyFilterItemDto {
    attributeName: string;
    attributeValue: string;
}
export declare class PaginationPolicyDto {
    search?: string;
    filterList?: PolicyFilterItemDto[];
    offset?: number;
    limit?: number;
}
