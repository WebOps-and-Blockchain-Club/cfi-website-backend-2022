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
import Club from "../entities/Club";
import Project from "../entities/Project";
import { CreateClubInput } from "../types/inputs/Club";
import { UserRole } from "../utils";
import User from "../entities/User";
import MyContext from "src/utils/context";

@Resolver((_type) => Club)
class ClubResolver {
  @Authorized([UserRole.ADMIN, UserRole.DEV])
  @Mutation(() => Boolean)
  async createClub(@Arg("CreateClubInput") createClubInput: CreateClubInput) {
    try {
      const club = await Club.create(createClubInput).save();
      return !!club;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.DEV])
  @Mutation(() => Club)
  async addSlot(@Arg("slot") slot: string, @Arg("clubId") clubId: string) {
    try {
      let club = await Club.findOneOrFail(clubId);
      club.slot = slot;
      let updatedCLub = await club.save();
      return updatedCLub;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.DEV, UserRole.MEMBER])
  @Query(() => Number)
  async getRegistrationCount() {
    let users = await User.find({
      relations: ["clubs"],
    });

    users = users.filter(
      (user) => user.slots != null && user.clubs.length != 0
    );
    return users.length;
  }

  @Authorized([UserRole.ADMIN, UserRole.DEV, UserRole.MEMBER])
  @Query(() => [User])
  async getRegisteredUsers(
    @Ctx() { user }: MyContext,
    @Arg("slot") slot: string
  ) {
    let users = await User.find({ relations: ["clubs"] });
    users = users.filter((u) => {
      let clubs = u.clubs;
      let ans = false;
      if (user.role == UserRole.MEMBER) {
        for (const club of clubs) if (club.email == user.email) ans = true;
      } else ans = true;
      return ans && u.slots?.includes(slot);
    });

    return users;
  }

  @Query(() => [Club])
  async getClubs() {
    try {
      return await Club.find({ order: { name: "ASC" }, relations: ["users"] });
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [Project])
  async projects(@Root() { id, projects }: Club) {
    try {
      if (projects) return projects;
      else
        return (await Club.findOneOrFail(id, { relations: ["projects"] }))
          .projects;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [User])
  async users(@Root() { id, users }: Club) {
    try {
      if (users) return users;
      let newClub = await Club.findOneOrFail(id, { relations: ["users"] });
      return newClub?.users;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default ClubResolver;
