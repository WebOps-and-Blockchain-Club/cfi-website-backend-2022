import { Field, InputType } from "type-graphql";
import User from "../../entities/User";
import Club from "../../entities/Club";
import { ProjectStatus } from "../../utils";

@InputType()
class CreateProjectInput {
  @Field({ nullable: true })
  id?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  q1?: string;

  @Field({ nullable: true })
  q2?: string;

  @Field({ nullable: true })
  q3?: string;

  @Field({ nullable: true })
  q4?: string;

  @Field(() => ProjectStatus)
  status: ProjectStatus;

  @Field(() => [String])
  clubIds: String[];

  clubs: Club[];
  createdBy?: User;
}

@InputType()
class FilterProject {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  clubIds?: string[];

  @Field(() => [String], { nullable: true })
  clubNames?: string[];
}

export { CreateProjectInput, FilterProject };
