import Project from "../entities/Project";
import Comment from "../entities/Comment";
import { CreateCommentInput } from "../types/inputs/Comment";
import MyContext from "../utils/context";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

@Resolver((_type) => Comment)
class CommentResolver {
  @Mutation(() => Comment)
  async createComment(
    @Arg("ProjectId") id: string,
    @Arg("CreateCommentInput") createCommentInput: CreateCommentInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      const project = await Project.findOneOrFail(id);
      createCommentInput.project = project;
      createCommentInput.createdBy = user;

      const comment = await Comment.create(createCommentInput).save();
      return comment;
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default CommentResolver;
