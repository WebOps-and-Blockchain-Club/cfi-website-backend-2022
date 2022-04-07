import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Project from "./Project";
import User from "./User";

@Entity("Comment")
@ObjectType("Comment")
class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  description: string;

  @UpdateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.comments)
  project: Project;

  @ManyToOne(() => User, (user) => user.comments)
  createdBy: User;
}

export default Comment;
