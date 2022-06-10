import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Club from "./Club";
import Comment from "./Comment";
import { autoGenString, ProjectStatus } from "../utils";
import Image from "./Image";

registerEnumType(ProjectStatus, { name: "ProjectStatus" });

@Entity("Project")
@ObjectType("Project")
class Project extends BaseEntity {
  @BeforeInsert()
  setId() {
    this.id =
      this.title.split(" ").join("-").toLowerCase() + "-" + autoGenString(12);
  }

  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  q1?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  q2?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  q3?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  q4?: string;

  @Column("enum", { enum: ProjectStatus })
  @Field(() => ProjectStatus)
  status: ProjectStatus;

  @ManyToMany(() => Club, (clubs) => clubs.projects)
  @JoinTable()
  clubs: Club[];

  @UpdateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  updatedAt: Date;

  @OneToMany(() => Image, (image) => image.project, { nullable: true })
  images: Image[];

  @ManyToOne(() => User, (user) => user.projects)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedProjects, { nullable: true })
  @JoinTable()
  likedBy: User[];

  @OneToMany(() => Comment, (comment) => comment.project, { nullable: true })
  comments: Comment[];
}

export default Project;
