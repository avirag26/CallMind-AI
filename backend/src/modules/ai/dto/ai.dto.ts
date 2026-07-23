import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class GenerateSummaryDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
