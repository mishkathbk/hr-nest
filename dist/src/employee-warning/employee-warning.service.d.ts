import { PrismaService } from "../prisma/prisma.service";
import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateEmployeeWarningDto } from "./dto/create-employee-warning.dto";
import { UpdateEmployeeWarningDto } from "./dto/update-employee-warning.dto";
import { PaginationEmployeeWarningDto } from "./dto/pagination-employee-warning.dto";
export declare class EmployeeWarningService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getByKey(id: number): Promise<any>;
    saveData(dto: CreateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
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
        employeeid: number;
        subject: string | null;
        warningmessage: string | null;
        employeewarningid: number;
    }>;
    updateData(id: number, dto: UpdateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
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
        employeeid: number;
        subject: string | null;
        warningmessage: string | null;
        employeewarningid: number;
    }>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
    list(companyId: number, isInactiveLoad?: boolean): Promise<any[]>;
    listPagination(dto: PaginationEmployeeWarningDto, companyId: number): Promise<PaginatedResult<any>>;
    private attachEmployeeNames;
}
