import { autoGenString, BlogStatus, ClubEnum } from "../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Tag from "./Tag";

registerEnumType(BlogStatus, { name: "BlogStatus" });
registerEnumType(ClubEnum, { name: "ClubEnum" });

@Entity("Blog")
@ObjectType("Blog")
class Blog extends BaseEntity {
  @BeforeInsert()
  async setId() {
    this.id = this.title.replace(" ", "-").toLowerCase() + autoGenString(12);
  }

  updateViews() {
    this.views = this.views + 1;
  }

  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  readingTime: string;

  @Column({ default: 0 })
  @Field(() => Number)
  views: number;

  @Column()
  @Field()
  content: string;

  @Column()
  @Field()
  author: string;

  @Column("enum", { enum: ClubEnum })
  @Field(() => ClubEnum)
  club: ClubEnum;

  @Column("enum", { enum: BlogStatus, default: BlogStatus.DRAFT })
  @Field(() => BlogStatus)
  status: BlogStatus;

  @UpdateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.blogs)
  createdBy: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs)
  @JoinTable()
  tags: Tag[];
}

export default Blog;
