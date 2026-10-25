import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'

export class EnqueueAudioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  exerciseId!: string
}

export class ExerciseSelectionDto {
  @ApiProperty({ enum: ['reading', 'writing', 'listening', 'speaking'] })
  @IsIn(['reading', 'writing', 'listening', 'speaking'])
  skill!: 'reading' | 'writing' | 'listening' | 'speaking'

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(30)
  part!: number
}

export class EnqueueExercisesDto {
  @ApiProperty({ type: [ExerciseSelectionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ExerciseSelectionDto)
  selections!: ExerciseSelectionDto[]
}

export class EnqueueMockDto {
  @ApiProperty()
  @IsInt()
  @Min(2)
  @Max(10000)
  setNumber!: number
}
