import { IsString, IsNotEmpty } from 'class-validator';

export class AddStudentDto {
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}
