import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Blog from "./Blog";
import Project from "./Project";
import Comment from "./Comment";
import { UserRole } from "../utils";
import Image from "./Image";

registerEnumType(UserRole, { name: "UserRole" });

@Entity("User")
@ObjectType("User")
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  @Field()
  name: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;

  @OneToMany(() => Blog, (blog) => blog.createdBy, { nullable: true })
  blogs: Blog[];

  @OneToMany(() => Project, (project) => project.createdBy, { nullable: true })
  projects: Project[];

  @OneToMany(() => Image, (image) => image.createdBy, { nullable: true })
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.createdBy, { nullable: true })
  comments: Comment[];
}

export default User;
