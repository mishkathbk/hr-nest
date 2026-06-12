import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { PaginationMemoDto } from './dto/pagination-memo.dto';
export declare class MemoController {
    private readonly memoService;
    constructor(memoService: MemoService);
    listPagination(dto: PaginationMemoDto, companyId: number): Promise<import("../common/interceptors/response.interceptor").PaginatedResult<any>>;
    list(inactive: string, companyId: number): Promise<any[]>;
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
}
