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
import Blog from "../entities/Blog";
import Tag from "../entities/Tag";
import {
  CreateTagInput,
  CreateTagsInput,
  EditTagInput,
} from "../types/inputs/Tag";
import { FilterBlog } from "../types/inputs/Blog";
import { Pagination } from "../types/inputs/Shared";
import { GetBlogsOutput } from "../types/objects/Blog";
import { UserRole } from "../utils";
import MyContext from "../utils/context";
import { filterBlogWithRole } from "../utils/blogFilter";

@Resolver((_type) => Tag)
class TagResolver {
  @Authorized([UserRole.ADMIN])
  @Mutation(() => Boolean)
  async createTag(@Arg("CreateTagInput") createTagInput: CreateTagInput) {
    try {
      const tag = await Tag.create(createTagInput).save();
      return !!tag;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Boolean)
  async createTags(
    @Arg("CreateTagsInput")
    createTagsInput: CreateTagsInput
  ) {
    try {
      let tagsModel: CreateTagInput[] = [];
      createTagsInput.names.map((_tag) => {
        let _tagModel = new CreateTagInput();
        _tagModel.name = _tag;
        tagsModel.push(_tagModel);
      });
      const tags = Tag.create(tagsModel);
      const tag = await Tag.save(tags);
      return !!tag;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Boolean)
  async editTag(
    @Arg("TagId") id: string,
    @Arg("EditTagInput") editTagInput: EditTagInput
  ) {
    try {
      const { affected } = await Tag.update(id, editTagInput);
      return affected === 1;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => [Tag], { nullable: true })
  async getTags() {
    try {
      return await Tag.find();
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => Tag, { nullable: true })
  async getTag(
    @Arg("TagId", { nullable: true }) id?: string,
    @Arg("TagName", { nullable: true }) name?: string
  ) {
    try {
      if (name) return await Tag.findOneOrFail({ where: { name } });
      else if (id) return await Tag.findOneOrFail(id);
      else throw new Error("Provide Tag ID or Tag Name");
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => GetBlogsOutput)
  async blogs(
    @Root() { id, blogs }: Tag,
    @Ctx() { user }: MyContext,
    @Arg("Filters", { nullable: true }) filters?: FilterBlog,
    @Arg("Pagination", { nullable: true }) pagination?: Pagination
  ) {
    try {
      let blogList: Blog[] | undefined;
      if (blogs) blogList = blogs;
      else blogList = (await Tag.findOne(id, { relations: ["blogs"] }))?.blogs;

      blogList = filterBlogWithRole(blogList, user);

      if (filters?.search) {
        blogList = blogList?.filter(
          (blog) =>
            blog.title.toLowerCase().includes(filters.search?.toLowerCase()!) ||
            blog.description
              .toLowerCase()
              .includes(filters.search?.toLowerCase()!)
        );
      }

      const count = blogList?.length;
      if (pagination) {
        blogList = blogList?.slice(pagination.skip, pagination.take);
      }

      blogList = blogList?.sort((a, b) =>
        a.updatedAt > b.updatedAt ? -1 : a.updatedAt < b.updatedAt ? 1 : 0
      );
      return { blogs: blogList, count };
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default TagResolver;
