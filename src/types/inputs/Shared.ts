import { Field, InputType } from "type-graphql";

@InputType()
class Pagination {
  @Field(() => Number)
  skip: number;

  @Field(() => Number)
  take: number;
}
export { Pagination };
