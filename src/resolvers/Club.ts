import {
  Arg,
  Authorized,
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
