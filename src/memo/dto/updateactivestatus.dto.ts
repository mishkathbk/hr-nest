import { IsBoolean } from 'class-validator';

export class UpdateActiveStatusDto {
  @IsBoolean()
  isactive: boolean;
}
