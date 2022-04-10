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

  @Query(() => [Club])
  async getClubs() {
    try {
      return await Club.find({ order: { name: "ASC" } });
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
}

export default ClubResolver;
