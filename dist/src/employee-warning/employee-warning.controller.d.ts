import { EmployeeWarningService } from './employee-warning.service';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { PaginationEmployeeWarningDto } from './dto/pagination-employee-warning.dto';
export declare class EmployeeWarningController {
    private readonly employeeWarningService;
    constructor(employeeWarningService: EmployeeWarningService);
    listSearch(q: string, companyId: number): Promise<any[]>;
    listPagination(dto: PaginationEmployeeWarningDto, companyId: number): Promise<import("../common/interceptors/response.interceptor").PaginatedResult<any>>;
    list(inactive: string, companyId: number): Promise<any[]>;
    getByKey(id: number): Promise<any>;
    saveData(dto: CreateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
        companyid: number | null;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        statuscd: number | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        isactive: boolean;
        employeewarningid: number;
        employeeid: number;
        subject: string | null;
        warningmessage: string | null;
    }>;
    updateData(id: number, dto: UpdateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
        companyid: number | null;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        statuscd: number | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        isactive: boolean;
        employeewarningid: number;
        employeeid: number;
        subject: string | null;
        warningmessage: string | null;
    }>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
}
