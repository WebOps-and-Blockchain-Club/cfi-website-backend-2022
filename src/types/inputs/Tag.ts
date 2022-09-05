import { Field, InputType } from "type-graphql";

@InputType()
class CreateTagInput {
  @Field()
  name: string;
}

@InputType()
class CreateTagsInput {
  @Field(() => [String])
  names: string[];
}

@InputType()
class EditTagInput {
  @Field({ nullable: true })
  name?: string;
}

export { CreateTagInput, CreateTagsInput, EditTagInput };
