import { Field, InputType } from "type-graphql";

@InputType()
class CreateTagInput {
  @Field()
  name: string;
}

@InputType()
class EditTagInput {
  @Field({ nullable: true })
  name?: string;
}

export { CreateTagInput, EditTagInput };
