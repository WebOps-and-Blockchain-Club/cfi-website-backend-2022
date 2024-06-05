import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../entities/User";
import Blog from "../entities/Blog";
import { AddCLubsInput, DereristerInp, LoginInput } from "../types/inputs/User";
import { emailRoleList, LoginType, RoleConstraints, UserRole } from "../utils";
import MyContext from "../utils/context";
import Project from "../entities/Project";
import Club from "../entities/Club";

const client = new OAuth2Client(process.env.CLIENT_ID);

@Resolver((_type) => User)
class UserResolver {
  @Mutation(() => User)
  async login(
    @Arg("LoginInputs") { token, loginType }: LoginInput,
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
      let user = await User.findOne({ email });

      // `user` doesn't exists in database -> create `user` in database
      if (!user) {
        // Assigning `role`
        let role;
        const emailList = emailRoleList.filter(
          (item) => item.email === email
        )[0];

        const clubs = await Club.find({ where: { email } });
        // For `ADMIN`, `DEV`
        if (emailList) role = emailList.role;
        // For `MEMBER`
        else if (clubs.length) role = UserRole.MEMBER;
        // For smail, `USER`
        else if (email.includes("@smail.iitm.ac.in")) role = UserRole.USER;
        //For summer school
        else if (loginType == LoginType.SUMMERSCHOOL) role = UserRole.USER;
        else throw new Error("Invalid User");

        // Store in database
        user = await User.create({
          name,
          email,
          role,
        }).save();
      }

      //Check role based on loginType
      if (
        loginType === LoginType.SIP &&
        !RoleConstraints.SIP.includes(user.role)
      )
        throw new Error("Invalid User");
      if (
        loginType === LoginType.BLOG &&
        !RoleConstraints.Blog.includes(user.role)
      )
        throw new Error("Invalid User");
      if (
        loginType === LoginType.ADMIN &&
        !RoleConstraints.Admin.includes(user.role)
      )
        throw new Error("Invalid User");
      if (
        loginType === LoginType.SUMMERSCHOOL &&
        !RoleConstraints.SummerSchool.includes(user.role)
      )
        throw new Error("Invalid User");

      const jwtToken = jwt.sign(user.id, process.env.JWT_SECRET!);

      // Send the cookie in response & return `role`
      res.cookie("token", jwtToken);
      return user;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized()
  @Query(() => User)
  getMe(@Ctx() { user }: MyContext) {
    return user;
  }

  @Mutation(() => User)
  async addCLubs(
    @Ctx() { user }: MyContext,
    @Arg("addClubsInput") addClubsInput: AddCLubsInput
  ) {
    const { name, clubIds, contact, smail, slots, college } = addClubsInput;
    let newUser = await User.findOne({
      where: { id: user.id },
      relations: ["clubs"],
    });
    if (!newUser) throw new Error("Invalid User");
    var clubs: Club[] = newUser!.clubs;

    if (clubIds) {
      await Promise.all(
        clubIds.map(async (id) => {
          const club = await Club.findOne({
            where: { id },
            relations: ["users"],
          });
          if (club) {
            clubs = clubs.concat(club);
          } else {
            throw new Error("Invalid Session");
          }
        })
      );
    }

    newUser!.clubs = clubs;
    newUser!.name = name;
    newUser!.slots = newUser.slots + " " + slots;
    newUser!.contact = contact;
    newUser!.college = college;
    if (smail) newUser!.smail = smail;

    let updatedUser = await newUser?.save();
    return updatedUser;
  }

  @Mutation(() => Boolean)
  async deregister(
    @Ctx() { user }: MyContext,
    @Arg("dereristerInp") dereristerInp: DereristerInp
  ) {
    const { clubIds, slot } = dereristerInp;
    console.log(clubIds, slot);
    try {
      let newUser = await User.findOne({
        where: { id: user.id },
        relations: ["clubs"],
      });

      if (!newUser) throw new Error("Invalid User");
      let clubs = newUser!.clubs;
      if (clubIds) {
        await Promise.all(
          clubIds.map(async (id) => {
            const club = await Club.findOne({
              where: { id },
              relations: ["users"],
            });
            if (
              club &&
              (!["F1", "F2"].includes(slot) ||
                (newUser!.slots.includes("F1") &&
                  !newUser!.slots.includes("F2") &&
                  slot == "F1") ||
                (newUser!.slots.includes("F2") &&
                  !newUser!.slots.includes("F1") &&
                  slot == "F2"))
            ) {
              clubs = clubs.filter((e) => e.id != club.id);
            }
          })
        );
      }

      newUser.clubs = clubs;
      console.log(newUser.clubs);
      let slots = newUser.slots;
      newUser.slots = slots
        .split(" ")
        .filter((e) => e != slot)
        .join(" ");
      console.log(newUser.slots);
      await newUser.save();
      return true;
    } catch (error) {
      console.log(error);
      throw new Error("Unsuccessful");
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    res.cookie("token", "", { httpOnly: true, maxAge: 1 });
    return true;
  }

  @FieldResolver(() => [Blog], { nullable: true })
  async blogs(@Root() { id, blogs }: User) {
    try {
      if (blogs) return blogs;
      else
        return (await User.findOneOrFail(id, { relations: ["blogs"] })).blogs;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [Project], { nullable: true })
  async projects(@Root() { id, projects }: User) {
    try {
      if (projects) return projects;
      else
        return (await User.findOneOrFail(id, { relations: ["projects"] }))
          .projects;
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default UserResolver;
