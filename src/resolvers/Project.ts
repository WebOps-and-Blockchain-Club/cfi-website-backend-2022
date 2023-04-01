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
import Project from "../entities/Project";
import Club from "../entities/Club";
import User from "../entities/User";
import Comment from "../entities/Comment";
import { FilterProject, CreateProjectInput } from "../types/inputs/Project";
import { GetProjectsOutput } from "../types/objects/Project";
import { Pagination } from "../types/inputs/Shared";
import MyContext from "../utils/context";
import { ProjectStatus, UserRole } from "../utils";

@Resolver((_type) => Project)
class ProjectResolver {
  @Authorized([UserRole.USER])
  @Mutation(() => Project)
  async createProject(
    @Arg("CreateProjectInput") createProjectInput: CreateProjectInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      let clubs: Club[] = [];
      await Promise.all(
        createProjectInput.clubIds.map(async (id: any) => {
          const club = await Club.findOne(id);
          if (clubs) clubs = clubs.concat([club]);
        })
      );
      createProjectInput.clubs = clubs;

      if (createProjectInput.id) {
        const project = await Project.findOneOrFail(createProjectInput.id, {
          relations: ["createdBy"],
        });
        if (project.createdBy.id === user.id) {
          project.title = createProjectInput.title;
          project.q1 = createProjectInput.q1;
          project.q2 = createProjectInput.q2;
          project.q3 = createProjectInput.q3;
          project.q4 = createProjectInput.q4;
          project.clubs = createProjectInput.clubs;
          project.status = createProjectInput.status;
          project.contact = createProjectInput.contact;
          const projectUpdated = await project.save();
          return projectUpdated;
        } else throw new Error("Unauthorised");
      } else {
        createProjectInput.createdBy = user;
        const project = await Project.create(createProjectInput).save();
        return project;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => GetProjectsOutput)
  async getProjects(
    @Arg("Filters", { nullable: true }) filters?: FilterProject,
    @Arg("Pagination", { nullable: true }) pagination?: Pagination
  ) {
    try {
      let projects = await Project.find({
        where: { status: ProjectStatus.PUBLIC },
        order: { updatedAt: "DESC" },
        relations: ["clubs", "comments"],
      });

      if (filters) {
        if (filters.search) {
          projects = projects.filter((project) =>
            JSON.stringify(project)
              .toLowerCase()
              .includes(filters.search?.toLowerCase()!)
          );
        }

        if (filters.clubIds) {
          projects = projects.filter(
            (project) =>
              project.clubs.filter((club) => filters.clubIds?.includes(club.id))
                .length !== 0
          );
        }

        if (filters.clubNames) {
          projects = projects.filter(
            (project) =>
              project.clubs.filter((club) =>
                filters.clubNames?.includes(club.name)
              ).length !== 0
          );
        }
      }

      const count = projects.length;
      if (pagination) {
        projects = projects.slice(pagination.skip, pagination.take);
      }

      return { projects, count };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => Project, { nullable: true })
  async getProject(@Arg("ProjectId") id: string) {
    try {
      return await Project.findOneOrFail(id);
    } catch (e) {
      throw new Error(e);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async toggleLikeProject(
    @Arg("ProjectId") id: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const project = await Project.findOne(id, { relations: ["likedBy"] });
      if (project) {
        if (project.likedBy.filter((u) => u.id === user.id).length)
          project.likedBy = project.likedBy.filter((e) => e.id !== user.id);
        else project.likedBy.push(user);

        const projectUpdated = await project.save();
        return !!projectUpdated;
      } else {
        throw new Error("Invalid event id");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  async deleteAllProjects(@Arg("ProjectId") id: string) {
    try {
      const { affected } = await Project.delete(id);
      return affected === 1;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [Club])
  async clubs(@Root() { id, clubs }: Project) {
    try {
      if (clubs) return clubs;
      else {
        return (await Project.findOneOrFail(id, { relations: ["clubs"] }))
          .clubs;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Project) {
    try {
      if (createdBy) return createdBy;
      else {
        return (await Project.findOneOrFail(id, { relations: ["createdBy"] }))
          .createdBy;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => Number)
  async likeCount(@Root() { id, likedBy }: Project) {
    try {
      if (likedBy) return likedBy.length;
      else {
        return (await Project.findOneOrFail(id, { relations: ["likedBy"] }))
          .likedBy.length;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => Boolean)
  async isLiked(@Root() { id, likedBy }: Project, @Ctx() { user }: MyContext) {
    if (!user) return false;
    if (likedBy) return likedBy.filter((u) => u.id === user.id).length;
    const project = await Project.findOne(id, { relations: ["likedBy"] });
    return project?.likedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => [Comment])
  async comments(@Root() { id, comments }: Project) {
    try {
      if (comments) return comments;
      else {
        return (await Project.findOneOrFail(id, { relations: ["comments"] }))
          .comments;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default ProjectResolver;
