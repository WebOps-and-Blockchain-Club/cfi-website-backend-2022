import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Blog from "./Blog";

@Entity("Tag")
@ObjectType("Tag")
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  name: string;

  @ManyToMany(() => Blog, (blogs) => blogs.tags, {
    cascade: true,
    nullable: true,
  })
  blogs: Blog[];
}

export default Tag;
