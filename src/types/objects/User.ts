import { Field, ObjectType, registerEnumType } from "type-graphql";
import { UserRole } from "../../utils";

registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
class LoginOutput {
  @Field(() => Boolean)
  authorized: boolean;

  @Field(() => UserRole)
  role: UserRole;
}

export { LoginOutput };
