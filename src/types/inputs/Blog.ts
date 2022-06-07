import { Field, InputType } from "type-graphql";
import { GraphQLUpload, Upload } from "graphql-upload";
import User from "../../entities/User";
import Tag from "../../entities/Tag";
import Club from "../../entities/Club";
import Image from "../../entities/Image";
import { BlogStatus } from "../../utils";

@InputType()
class CreateBlogInput {
  @Field({ nullable: true })
  id?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => GraphQLUpload, { nullable: true })
  imageData: Upload;

  @Field({ nullable: true })
  imageUrl: string;

  @Field({ nullable: true })
  readingTime: number;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  author: string;

  @Field(() => BlogStatus)
  status: BlogStatus;

  @Field({ nullable: true })
  clubId: string;

  @Field(() => [String], { nullable: true })
  tagIds: String[];

  club: Club;
  tags: Tag[];
  image: Image;
  createdBy: User;
}

@InputType()
class FilterBlog {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  clubId?: string[];

  @Field(() => [String], { nullable: true })
  clubName?: string[];

  @Field(() => [String], { nullable: true })
  tagIds?: string[];

  @Field(() => [String], { nullable: true })
  tagNames?: string[];
}

export { CreateBlogInput, FilterBlog };
