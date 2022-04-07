import { Field, ObjectType } from "type-graphql";
import Project from "../../entities/Project";

@ObjectType()
class GetProjectsOutput {
  @Field(() => [Project], { nullable: true })
  projects: Project[];

  @Field(() => Number)
  count: number;
}

export { GetProjectsOutput };
