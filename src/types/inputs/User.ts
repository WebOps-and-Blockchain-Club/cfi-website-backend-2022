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

@InputType()
class AddCLubsInput {
  @Field()
  name: string;

  @Field(() => [String])
  clubIds: string[];

  @Field()
  contact: string;

  @Field()
  slots: string;
}
export { LoginInput, AddCLubsInput };
