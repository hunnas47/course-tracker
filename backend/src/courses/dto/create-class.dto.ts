import { IsString, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    date: string;

    @IsUUID()
    subjectId: string;
}
