import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../entities/User";
import { LoginInput } from "../types/inputs/User";
import { LoginOutput } from "../types/objects/User";
import { emailRoleList, UserRole } from "../utils";
import MyContext from "../utils/context";

const client = new OAuth2Client(process.env.CLIENT_ID);

@Resolver((_type) => User)
class UserResolver {
  @Mutation(() => LoginOutput)
  async login(
    @Arg("LoginInputs") { token }: LoginInput,
    @Ctx() { res }: MyContext
  ) {
    try {
      // Get the `user` details from google auth
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });

      const { name, email } = ticket.getPayload()!;
      if (!name || !email) throw new Error("Google Login Falid");

      // Get the `user` details from database
      const user = await User.findOne({ email });

      // If `user` doesn't exists in database
      if (!user) {
        // Assigning `role`
        let role;
        const emailList = emailRoleList.filter(
          (item) => item.email === email
        )[0];

        // For `ADMIN`, `MEMBER`, `DEV`
        if (emailList) role = emailList.role;
        // For smail, `USER`
        else if (email.includes("@smail.iitm.ac.in")) role = UserRole.USER;
        else throw new Error("Invalid User");

        // Store in database
        const createdUser = await User.create({
          name,
          email,
          role,
        }).save();

        const token = jwt.sign(createdUser.id, process.env.JWT_SECRET!);

        // Send the cookie in response & return `role`
        res.cookie("token", token);
        return { authorized: !!createdUser, role: createdUser.role };
      }

      // If `user` exists in database
      else {
        const token = jwt.sign(user.id, process.env.JWT_SECRET!);

        // Send the cookie in response & return `role`
        res.cookie("token", token);
        return {
          authorized: true,
          role: user.role,
          email: user.email,
          name: user.name,
        };
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized()
  @Query(() => User)
  getMe(@Ctx() { user }: MyContext) {
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    res.cookie("token", "", { httpOnly: true, maxAge: 1 });
    return true;
  }
}

export default UserResolver;
