import Blog from "../entities/Blog";
import Club from "../entities/Club";
import Tag from "../entities/Tag";
import Image from "../entities/Image";
import User from "../entities/User";
import { CreateBlogInput, FilterBlog } from "../types/inputs/Blog";
import { Pagination } from "../types/inputs/Shared";
import { GetBlogsOutput } from "../types/objects/Blog";
import { BlogStatus, UserRole } from "../utils";
import { filterBlogWithRole } from "../utils/blogFilter";
import MyContext from "../utils/context";
import { uploadFiles } from "../utils/uploads";
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
  @Authorized()
  @Mutation(() => Blog)
  async createBlog(
    @Arg("CreateBlogInput") createBlogInput: CreateBlogInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      if (
        createBlogInput.status !== BlogStatus.DRAFT &&
        (!createBlogInput.id ||
          !createBlogInput.description ||
          !createBlogInput.imageData ||
          !createBlogInput.readingTime ||
          !createBlogInput.content ||
          !createBlogInput.author ||
          !createBlogInput.clubId ||
          !createBlogInput.tagIds)
      )
        throw new Error("Enter all the required fields");

      if (
        createBlogInput.status === BlogStatus.APPROVED ||
        createBlogInput.status === BlogStatus.REJECTED
      )
        throw new Error("Invalid Blog Status");

      if (createBlogInput.tagIds) {
        let tags: Tag[] = [];
        await Promise.all(
          createBlogInput.tagIds.map(async (id: any) => {
            const tag = await Tag.findOneOrFail(id);
            if (tags) tags = tags.concat([tag]);
          })
        );
        createBlogInput.tags = tags;
      }

      if (createBlogInput.clubId)
        createBlogInput.club = await Club.findOneOrFail(createBlogInput.clubId);

      if (createBlogInput.imageData) {
        const name = await uploadFiles(createBlogInput.imageData);
        const image = await Image.create({
          name,
          createdBy: user,
        }).save();
        createBlogInput.image = image;
      }

      if (createBlogInput.id) {
        const blog = await Blog.findOneOrFail(createBlogInput.id, {
          relations: ["createdBy", "club"],
        });
        if (
          (blog.createdBy.id === user.id &&
            [BlogStatus.DRAFT, BlogStatus.PENDING].includes(blog.status)) ||
          (blog.club.email === user.email &&
            [
              BlogStatus.PENDING,
              BlogStatus.APPROVED_BY_CLUB,
              BlogStatus.REJECTED_BY_CLUB,
              BlogStatus.REJECTED,
            ].includes(blog.status)) ||
          [UserRole.ADMIN, UserRole.DEV].includes(user.role)
        ) {
          blog.title = createBlogInput.title;
          blog.description = createBlogInput.description;
          blog.image = createBlogInput.image;
          blog.readingTime = createBlogInput.readingTime;
          blog.content = createBlogInput.content;
          blog.author = createBlogInput.author;
          blog.club = createBlogInput.club;
          blog.status = createBlogInput.status;
          blog.tags = createBlogInput.tags;
          const blogUpdated = await blog.save();
          return blogUpdated;
        } else throw new Error("Not allowed to edit");
      } else {
        createBlogInput.createdBy = user;
        const blog = await Blog.create(createBlogInput).save();
        return blog;
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.MEMBER])
  @Mutation(() => Boolean)
  async updateBlogStatus(
    @Arg("BlogId") id: string,
    @Arg("BlogStatus") status: BlogStatus,
    @Ctx() { user }: MyContext
  ) {
    try {
      const blog = await Blog.findOneOrFail(id, {
        relations: ["club"],
      });

      if (
        ([BlogStatus.APPROVED_BY_CLUB, BlogStatus.REJECTED_BY_CLUB].includes(
          status
        ) &&
          user.role !== UserRole.MEMBER &&
          blog.club.email !== user.email) ||
        ([BlogStatus.APPROVED, BlogStatus.REJECTED].includes(status) &&
          user.role !== UserRole.ADMIN)
      )
        throw new Error("Invalid Status");

      blog.status === status;
      const blogUpdated = await blog.save();
      return blogUpdated;
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
        relations: ["tags", "club"],
        order: { updatedAt: "DESC" },
      });

      blogs = filterBlogWithRole(blogs, user)!;

      if (filters) {
        if (filters.search) {
          blogs = blogs.filter((blog) =>
            JSON.stringify(blog)
              .toLowerCase()
              .includes(filters.search?.toLowerCase()!)
          );
        }

        if (filters.clubId) {
          blogs = blogs.filter((blog) =>
            filters.clubId?.includes(blog.club.id)
          );
        }

        if (filters.clubName) {
          blogs = blogs.filter((blog) =>
            filters.clubName?.includes(blog.club.name)
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

  @FieldResolver(() => Image, { nullable: true })
  async image(@Root() { id, image }: Blog) {
    try {
      if (image) return image;
      else return (await Blog.findOne(id, { relations: ["image"] }))?.image;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => Club, { nullable: true })
  async club(@Root() { id, club }: Blog) {
    try {
      if (club) return club;
      else return (await Blog.findOne(id, { relations: ["club"] }))?.club;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => [Tag], { nullable: true })
  async tags(@Root() { id, tags }: Blog) {
    try {
      if (tags) return tags;
      else return (await Blog.findOne(id, { relations: ["tags"] }))?.tags;
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Blog) {
    try {
      if (createdBy) return createdBy;
      else
        return (await Blog.findOne(id, { relations: ["createdBy"] }))
          ?.createdBy;
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default BlogResolver;
