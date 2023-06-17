import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Blog from "./Blog";
import Project from "./Project";
import User from "./User";

@Entity("Club")
@ObjectType("Club")
class Club extends BaseEntity {
  @BeforeInsert()
  setId() {
    this.id = this.name.split(" ").join("-").toLowerCase();
  }

  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  email: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  slot: string;

  @ManyToMany(() => Project, (projects) => projects.clubs, { nullable: true })
  projects: Project[];

  @ManyToMany(() => User, (user) => user.clubs, { nullable: true })
  users: User[];

  @OneToMany(() => Blog, (blogs) => blogs.club, { nullable: true })
  blogs: Blog[];
}

export default Club;
