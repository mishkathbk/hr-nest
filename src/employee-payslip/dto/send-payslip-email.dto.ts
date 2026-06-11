import { IsInt, IsArray } from "class-validator";

export class SendPayslipEmailDto {
  @IsArray()
  @IsInt({ each: true })
  payrollGenerationIds: number[];
}
