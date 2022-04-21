import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeRemove,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Project from "./Project";
import User from "./User";
import { deleteFile } from "../utils/uploads";
import Blog from "./Blog";

@Entity("Image")
@ObjectType("Image")
class Image extends BaseEntity {
  @BeforeRemove()
  deleteImage() {
    deleteFile(this.name);
  }

  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.images, { nullable: true })
  project: Project;

  @OneToOne(() => Blog, (blog) => blog.image, { nullable: true })
  blog: Blog;

  @ManyToOne(() => User, (user) => user.images)
  createdBy: User;
}

export default Image;
