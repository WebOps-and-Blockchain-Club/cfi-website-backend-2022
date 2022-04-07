import { Field, InputType } from "type-graphql";

@InputType()
class CreateClubInput {
  @Field()
  name: string;
}

export { CreateClubInput };
