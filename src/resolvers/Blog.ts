import Blog from "../entities/Blog";
import Club from "../entities/Club";
import Tag from "../entities/Tag";
import Image from "../entities/Image";
import User from "../entities/User";
import { CreateBlogInput, FilterBlog } from "../types/inputs/Blog";
import { Pagination } from "../types/inputs/Shared";
import { GetBlogsOutput } from "../types/objects/Blog";
import { BlogStatus, getAdminMails, RoleConstraints, UserRole } from "../utils";
import { filterBlogWithRole } from "../utils/blogFilter";
import MyContext from "../utils/context";
import { deleteFile, uploadFiles } from "../utils/uploads";
import { mail } from "../utils/mail";
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
        createBlogInput.status === BlogStatus.PENDING &&
        (!createBlogInput.title ||
          !createBlogInput.description ||
          (!createBlogInput.imageData && !createBlogInput.imageUrl) ||
          !createBlogInput.readingTime ||
          !createBlogInput.content ||
          !createBlogInput.author ||
          !createBlogInput.clubId ||
          !createBlogInput.tagIds)
      )
        throw new Error("Enter all the required fields");

      if (
        createBlogInput.status === BlogStatus.APPROVED_BY_CLUB ||
        createBlogInput.status === BlogStatus.REJECTED_BY_CLUB ||
        createBlogInput.status === BlogStatus.APPROVED ||
        createBlogInput.status === BlogStatus.REJECTED
      )
        throw new Error("Invalid Blog Status");

      if (RoleConstraints.Admin.includes(user.role))
        createBlogInput.status = BlogStatus.PENDING;

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

      if (createBlogInput.imageData && createBlogInput.imageUrl) {
        deleteFile(createBlogInput.imageUrl.split("/").pop()!);
      }

      if (createBlogInput.imageData) {
        const name = await uploadFiles(createBlogInput.imageData);
        const image = await Image.create({
          name,
          createdBy: user,
        }).save();
        createBlogInput.image = image;
      }

      let blogR;

      if (createBlogInput.id) {
        const blog = await Blog.findOneOrFail(createBlogInput.id, {
          relations: ["createdBy", "club"],
        });
        if (
          (blog.createdBy.id === user.id &&
            [
              BlogStatus.DRAFT,
              BlogStatus.REJECTED_BY_CLUB,
              BlogStatus.REJECTED,
            ].includes(blog.status)) ||
          (blog.club.email === user.email &&
            [
              BlogStatus.PENDING,
              BlogStatus.REJECTED_BY_CLUB,
              BlogStatus.REJECTED,
            ].includes(blog.status)) ||
          [UserRole.ADMIN].includes(user.role)
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
          blogR = await blog.save();
        } else throw new Error("Not allowed to edit");
      } else {
        createBlogInput.createdBy = user;
        blogR = await Blog.create(createBlogInput).save();
      }

      if (
        !!blogR &&
        blogR.status === BlogStatus.PENDING &&
        user.role === UserRole.USER
      )
        process.env.NODE_ENV === "production"
          ? mail({
              toEmail: [blogR.club.email, ...getAdminMails()],
              subject: `New Blog Created || ${blogR.title}`,
              htmlContent: `New Blog is been created with title - ${blogR.title} by ${blogR.createdBy.name} with reference to ${blogR.club.name}.`,
            })
          : console.log(
              blogR.club.email,
              blogR.title,
              blogR.createdBy.name,
              blogR.club.name
            );

      return blogR;
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
        relations: ["club", "createdBy"],
      });

      if (
        /**
         * Status Validation for `MEMBER` role
         * 3 Conditions:
         * 1. Accepts 2 status: `APPROVED_BY_CLUB` or `REJECTED_BY_CLUB`
         * 2. Status update should be done only for `PENDING` blog
         * 3. It should be done by respective club
         */
        (user.role === UserRole.MEMBER &&
          (![BlogStatus.APPROVED_BY_CLUB, BlogStatus.REJECTED_BY_CLUB].includes(
            status
          ) ||
            blog.status !== BlogStatus.PENDING ||
            blog.club.email !== user.email)) ||
        /**
         * Status Validation for `ADMIN` role
         * 2 Conditions:
         * 1. Accepts 2 status: `APPROVED` or `REJECTED`
         * 2. Status update should be done only for `APPROVED_BY_CLUB` blog
         */
        (user.role === UserRole.ADMIN &&
          (![BlogStatus.APPROVED, BlogStatus.REJECTED].includes(status) ||
            blog.status !== BlogStatus.APPROVED_BY_CLUB))
      )
        throw new Error("Invalid Status");

      blog.status = status;
      const blogUpdated = await blog.save();

      if (!!blogUpdated)
        process.env.NODE_ENV === "production"
          ? mail({
              toEmail: [blogUpdated.createdBy.email, ...getAdminMails()],
              subject: `${blogUpdated.title} || Blog Status Updated to ${blogUpdated.status}`,
              htmlContent: `New Blog with title - ${blogUpdated.title} by ${blogUpdated.createdBy.name} with reference to ${blogUpdated.club.name}, status changed to ${blogUpdated.status}.`,
            })
          : console.log(
              blogUpdated.status,
              blogUpdated.title,
              blogUpdated.createdBy.name,
              blogUpdated.createdBy.email,
              blogUpdated.club.name
            );

      return !!blogUpdated;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized([UserRole.ADMIN, UserRole.MEMBER])
  @Mutation(() => Boolean)
  async suggestEdit(
    @Arg("BlogId") id: string,
    @Arg("Content") content: string
  ) {
    try {
      const blog = await Blog.findOneOrFail(id, {
        relations: ["createdBy", "club"],
      });

      process.env.NODE_ENV === "production"
        ? mail({
            toEmail: [blog.createdBy.email],
            ccEmail: blog.club.email,
            replyToEmail: blog.club.email,
            subject: `${blog.title} || Blog Suggestions`,
            htmlContent: content,
          })
        : console.log(
            blog.title,
            blog.createdBy.name,
            blog.club.email,
            content
          );

      return true;
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
        relations: ["tags", "club", "createdBy"],
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
          blogs = blogs.filter(
            (blog) =>
              blog.tags.filter((tag) => filters.tagIds?.includes(tag.id))
                .length !== 0
          );
        }

        if (filters.tagNames) {
          blogs = blogs.filter(
            (blog) =>
              blog.tags.filter((tag) => filters.tagNames?.includes(tag.name))
                .length !== 0
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
      const blog = await Blog.findOneOrFail(id, {
        relations: ["tags", "club", "createdBy"],
      });
      const filteredBlog = filterBlogWithRole([blog], user);
      if (!filteredBlog) throw new Error("Not authorised to view this blog");
      else return filteredBlog[0];
    } catch (e) {
      throw new Error(e);
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  async updateViews(@Arg("BlogId") id: string) {
    try {
      const blog = await Blog.findOneOrFail(id, {
        where: { status: BlogStatus.APPROVED },
      });
      blog.views += 1;
      const blogUpdated = blog.save();
      return !!blogUpdated;
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
