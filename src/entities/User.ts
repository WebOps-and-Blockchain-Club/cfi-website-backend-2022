import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Blog from "./Blog";
import Project from "./Project";
import Comment from "./Comment";
import { UserRole } from "../utils";
import Image from "./Image";
import Club from "./Club";

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

  @Column({ nullable: true })
  @Field({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  college: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  slots: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  smail: string;

  @OneToMany(() => Blog, (blog) => blog.createdBy, { nullable: true })
  blogs: Blog[];

  @OneToMany(() => Project, (project) => project.createdBy, { nullable: true })
  projects: Project[];

  @ManyToMany(() => Project, (project) => project.createdBy, { nullable: true })
  likedProjects: Project[];

  @ManyToMany(() => Club, (club) => club.users, { nullable: true })
  @Field(() => [Club], { nullable: true })
  clubs: Club[];

  @OneToMany(() => Image, (image) => image.createdBy, { nullable: true })
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.createdBy, { nullable: true })
  comments: Comment[];
}

export default User;
