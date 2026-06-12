import {
  IsOptional,
  IsBoolean,
} from "class-validator";

export class UpdateActiveStatusDto {
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}
