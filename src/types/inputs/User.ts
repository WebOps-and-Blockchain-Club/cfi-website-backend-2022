import { LoginType } from "../../utils";
import { Field, InputType, registerEnumType } from "type-graphql";

registerEnumType(LoginType, { name: "LoginType" });

@InputType()
class LoginInput {
  @Field()
  token: string;

  @Field(() => LoginType)
  loginType: LoginType;
}
export { LoginInput };
