import { Field, InputType } from "type-graphql";

@InputType()
class LoginInput {
  @Field()
  token: string;
}
export { LoginInput };
