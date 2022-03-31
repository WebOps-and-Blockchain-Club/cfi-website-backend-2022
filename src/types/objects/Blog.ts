import Blog from "../../entities/Blog";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
class GetBlogsOutput {
  @Field(() => [Blog], { nullable: true })
  blogs: Blog[];

  @Field(() => Number)
  count: number;
}

export { GetBlogsOutput };
