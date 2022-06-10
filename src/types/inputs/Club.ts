import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
class CreateClubInput {
  @Field()
  name: string;

  @Field()
  @IsEmail()
  email: string;
}

export { CreateClubInput };
