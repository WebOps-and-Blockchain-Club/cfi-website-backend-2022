import Blog from "../entities/Blog";
import Tag from "../entities/Tag";
import {
  CreateBlogInput,
  EditBlogInput,
  FilterBlog,
} from "../types/inputs/Blog";
import { Pagination } from "../types/inputs/Shared";
import { GetBlogsOutput } from "../types/objects/Blog";
import { BlogStatus, UserRole } from "../utils";
import { filterBlogWithRole } from "../utils/blogFilter";
import MyContext from "../utils/context";
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

@Resolver((_type) => Blog)
class BlogResolver {
  @Authorized([UserRole.ADMIN, UserRole.DEV, UserRole.MEMBER])
  @Mutation(() => Blog)
  async createBlog(
    @Arg("CreateBlogInput") createBlogInput: CreateBlogInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      let tags: Tag[] = [];
      await Promise.all(
        createBlogInput.tagIds.map(async (id: any) => {
          const tag = await Tag.findOne(id);
          if (tag) tags = tags.concat([tag]);
        })
      );
      createBlogInput.tags = tags;
      createBlogInput.createdBy = user;

      const blog = await Blog.create(createBlogInput).save();
      return blog;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.DEV, UserRole.MEMBER])
  @Mutation(() => Boolean)
  async editBlog(
    @Arg("BlogId") id: string,
    @Arg("EditBlogInput") editBlogInput: EditBlogInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      const blog = await Blog.findOneOrFail(id);
      if (
        [UserRole.ADMIN, UserRole.DEV].includes(user.role) ||
        blog.createdBy.id === user.id
      ) {
        if (editBlogInput.tagIds) {
          let tags: Tag[] = [];
          await Promise.all(
            editBlogInput.tagIds.map(async (id: any) => {
              const tag = await Tag.findOne(id);
              if (tag) tags = tags.concat([tag]);
            })
          );
          editBlogInput.tags = tags;
        }
        const { affected } = await Blog.update(id, editBlogInput);
        return affected === 1;
      } else throw new Error("Not authorised to edit this blog");
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.MEMBER])
  @Mutation(() => Boolean)
  async updateBlogStatus(
    @Arg("BlogId") id: string,
    @Ctx() { user }: MyContext,
    @Arg("BlogStatus") status: BlogStatus
  ) {
    try {
      const blog = await Blog.findOneOrFail(id);
      if (blog.createdBy.id === user.id) {
        const { affected } = await Blog.update(id, {
          status: BlogStatus.PENDING,
        });
        return affected === 1;
      } else if (user.role === UserRole.ADMIN) {
        const { affected } = await Blog.update(id, {
          status,
        });
        return affected === 1;
      } else throw new Error("Not authorised to update this blog status");
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => GetBlogsOutput)
  async getBlogs(
    @Ctx() { user }: MyContext,
    @Arg("Filters", { nullable: true }) filters?: FilterBlog,
    @Arg("Pagination", { nullable: true }) pagination?: Pagination
  ) {
    try {
      let blogs = await Blog.find({
        relations: ["tags"],
        order: { updatedAt: "DESC" },
      });

      blogs = filterBlogWithRole(blogs, user)!;

      if (filters) {
        if (filters.search) {
          blogs = blogs.filter(
            (blog) =>
              blog.title
                .toLowerCase()
                .includes(filters.search?.toLowerCase()!) ||
              blog.description
                .toLowerCase()
                .includes(filters.search?.toLowerCase()!)
          );
        }

        if (filters.tagIds) {
          blogs = blogs.filter((blog) =>
            blog.tags.filter((tag) => filters.tagIds?.includes(tag.id))
          );
        }

        if (filters.tagNames) {
          blogs = blogs.filter((blog) =>
            blog.tags.filter((tag) => filters.tagNames?.includes(tag.name))
          );
        }
      }

      const count = blogs.length;
      if (pagination) {
        blogs = blogs.slice(pagination.skip, pagination.take);
      }

      return { blogs, count };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => Blog, { nullable: true })
  async getBlog(@Arg("BlogId") id: string, @Ctx() { user }: MyContext) {
    try {
      const blog = await Blog.findOneOrFail(id);
      const filteredBlog = filterBlogWithRole([blog], user);
      if (!filteredBlog) throw new Error("Not authorised to view this blog");
      else return filteredBlog[0];
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => Boolean, { nullable: true })
  async updateViews(@Arg("BlogId") id: string) {
    try {
      const blog = await Blog.findOneOrFail(id, {
        where: { status: BlogStatus.APPROVED },
      });
      blog.updateViews();
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [Tag])
  async blogs(@Root() { id, tags }: Blog) {
    try {
      if (tags) return tags;
      else return (await Blog.findOne(id, { relations: ["tags"] }))?.tags;
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default BlogResolver;
