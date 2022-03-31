import User from "../../entities/User";
import { Club } from "../../utils";
import { Field, InputType } from "type-graphql";
import Tag from "../../entities/Tag";

@InputType()
class CreateBlogInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  readingTime: string;

  @Field()
  content: string;

  @Field()
  author: string;

  @Field(() => Club)
  club: Club;

  @Field(() => [String])
  tagIds: String[];

  createdBy: User;
  tags: Tag[];
}

@InputType()
class EditBlogInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  readingTime?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  author?: string;

  @Field(() => Club, { nullable: true })
  club?: Club;

  @Field(() => [String], { nullable: true })
  tagIds?: String[];

  tags?: Tag[];
}

@InputType()
class FilterBlog {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tagIds?: string[];

  @Field(() => [String], { nullable: true })
  tagNames?: string[];
}

export { CreateBlogInput, EditBlogInput, FilterBlog };
