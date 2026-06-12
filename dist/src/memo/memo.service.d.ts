import { PrismaService } from "../prisma/prisma.service";
import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateMemoDto } from "./dto/create-memo.dto";
import { UpdateMemoDto } from "./dto/update-memo.dto";
import { PaginationMemoDto } from "./dto/pagination-memo.dto";
export declare class MemoService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getByKey(id: number): Promise<any>;
    saveData(dto: CreateMemoDto, currentId: number, companyId: number): Promise<{
        statuscd: number | null;
        isactive: boolean;
        companyid: number | null;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        documentgroupid: number | null;
        memoid: number;
        memocode: string;
        memotypecd: number | null;
        memosubject: string | null;
        memotext: string | null;
    }>;
    updateData(id: number, dto: UpdateMemoDto, currentId: number, companyId: number): Promise<{
        statuscd: number | null;
        isactive: boolean;
        companyid: number | null;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        documentgroupid: number | null;
        memoid: number;
        memocode: string;
        memotypecd: number | null;
        memosubject: string | null;
        memotext: string | null;
    }>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
    list(companyId: number, isInactiveLoad?: boolean): Promise<any[]>;
    listPagination(dto: PaginationMemoDto, companyId: number): Promise<PaginatedResult<any>>;
    private attachEmployeeNames;
}
