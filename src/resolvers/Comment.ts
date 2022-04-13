import Project from "../entities/Project";
import Comment from "../entities/Comment";
import { CreateCommentInput } from "../types/inputs/Comment";
import MyContext from "../utils/context";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import User from "../entities/User";

@Resolver((_type) => Comment)
class CommentResolver {
  @Mutation(() => Comment)
  async createComment(
    @Arg("CreateCommentInput") createCommentInput: CreateCommentInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      const project = await Project.findOneOrFail(createCommentInput.projectId);
      createCommentInput.project = project;
      createCommentInput.createdBy = user;

      const comment = await Comment.create(createCommentInput).save();
      return comment;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Mutation(() => Boolean)
  async deleteComment(@Arg("CommentId") id: string) {
    try {
      const { affected } = await Comment.delete(id);
      return affected === 1;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Comment) {
    try {
      if (createdBy) return createdBy;
      else {
        return (await Comment.findOneOrFail(id, { relations: ["createdBy"] }))
          .createdBy;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default CommentResolver;
