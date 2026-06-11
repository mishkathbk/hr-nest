import { EmployeeWarningService } from './employee-warning.service';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { PaginationEmployeeWarningDto } from './dto/pagination-employee-warning.dto';
export declare class EmployeeWarningController {
    private readonly employeeWarningService;
    constructor(employeeWarningService: EmployeeWarningService);
    listPagination(dto: PaginationEmployeeWarningDto, companyId: number): Promise<import("../common/interceptors/response.interceptor").PaginatedResult<any>>;
    list(inactive: string, companyId: number): Promise<any[]>;
    getByKey(id: number): Promise<any>;
    saveData(dto: CreateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
        companyid: number | null;
        isactive: boolean;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        statuscd: number | null;
        subject: string | null;
        employeewarningid: number;
        employeeid: number;
        warningmessage: string | null;
    }>;
    updateData(id: number, dto: UpdateEmployeeWarningDto, currentId: number, companyId: number): Promise<{
        companyid: number | null;
        isactive: boolean;
        createdby: number | null;
        createddate: Date | null;
        modifiedby: number | null;
        modifieddate: Date | null;
        isdeleted: boolean | null;
        deleteby: number | null;
        deletedate: Date | null;
        statuscd: number | null;
        subject: string | null;
        employeewarningid: number;
        employeeid: number;
        warningmessage: string | null;
    }>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
}
