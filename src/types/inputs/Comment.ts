import User from "../../entities/User";
import Project from "../../entities/Project";
import { Field, InputType } from "type-graphql";

@InputType()
class CreateCommentInput {
  @Field()
  description: string;

  @Field(() => String)
  projectId: String;

  createdBy: User;
  project: Project;
}

export { CreateCommentInput };
