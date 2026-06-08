export declare const ATTENDANCE_SOURCE_MOBILE = 2;
export declare class AttendanceDetDTO {
    attendanceDetId?: number;
    attendanceId?: number;
    typeId?: number;
    attendanceSourceTypeCd?: number;
    attTime?: string;
}
export declare class SaveByDateDto {
    attendanceId?: number;
    employeeId: number;
    attendanceDate: string;
    attendanceSourceTypeCd?: number;
    isManual?: boolean;
    notes?: string;
    attendanceDetDTOList?: AttendanceDetDTO[];
}
