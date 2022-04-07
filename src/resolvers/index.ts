import BlogResolver from "./Blog";
import ClubResolver from "./Club";
import CommentResolver from "./Comment";
import ImageResolver from "./Image";
import ProjectResolver from "./Project";
import TagResolver from "./Tag";
import UserResolver from "./User";

export default [
  UserResolver,
  BlogResolver,
  TagResolver,
  ProjectResolver,
  CommentResolver,
  ClubResolver,
  ImageResolver,
] as const;
