import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from "typeorm";
import Project from "./Project";

@Entity("Club")
@ObjectType("Club")
class Club extends BaseEntity {
  @BeforeInsert()
  setId() {
    this.id = this.name.replace(" ", "-").toLowerCase();
  }

  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @ManyToMany(() => Project, (projects) => projects.clubs, { nullable: true })
  projects: Project[];
}

export default Club;
