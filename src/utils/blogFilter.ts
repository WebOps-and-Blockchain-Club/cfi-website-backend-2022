import Blog from "../entities/Blog";
import User from "../entities/User";
import { BlogStatus, UserRole } from ".";

export const filterBlogWithRole = (
  blogs: Blog[] | undefined,
  user: User | undefined
) => {
  if (user && [UserRole.ADMIN, UserRole.DEV].includes(user?.role)) {
    return blogs?.filter((blog) =>
      [BlogStatus.PENDING, BlogStatus.APPROVED, BlogStatus.REJECTED].includes(
        blog.status
      )
    );
  } else if (user && UserRole.MEMBER === user.role) {
    return blogs?.filter(
      (blog) =>
        [BlogStatus.DRAFT, BlogStatus.APPROVED].includes(blog.status) ||
        blog.createdBy.id === user.id
    );
  } else {
    return blogs?.filter((blog) => blog.status === BlogStatus.APPROVED);
  }
};
