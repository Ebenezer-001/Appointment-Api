import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  Min,
  Matches,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID()
  staffId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}
