import { IsNotEmpty } from "class-validator";

export class CreateContributionDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}
