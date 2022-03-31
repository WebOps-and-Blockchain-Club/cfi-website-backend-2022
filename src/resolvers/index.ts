import BlogResolver from "./Blog";
import TagResolver from "./Tag";
import UserResolver from "./User";

export default [UserResolver, BlogResolver, TagResolver] as const;
