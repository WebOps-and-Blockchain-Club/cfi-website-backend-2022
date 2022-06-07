import { autoGenString, BlogStatus } from "../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Tag from "./Tag";
import Club from "./Club";
import Image from "./Image";

registerEnumType(BlogStatus, { name: "BlogStatus" });

@Entity("Blog")
@ObjectType("Blog")
class Blog extends BaseEntity {
  @BeforeInsert()
  async setId() {
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
  description: string;

  @OneToOne(() => Image, (image) => image.blog, { nullable: true })
  @JoinColumn()
  image: Image;

  @Column({ type: "numeric", nullable: true })
  @Field(() => Number, { nullable: true })
  readingTime: number;

  @Column({ default: 0 })
  @Field(() => Number)
  views: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  content: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  author: string;

  @Column("enum", { enum: BlogStatus, default: BlogStatus.DRAFT })
  @Field(() => BlogStatus)
  status: BlogStatus;

  @UpdateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  updatedAt: Date;

  @ManyToOne(() => Club, (club) => club.blogs, { nullable: true })
  club: Club;

  @ManyToOne(() => User, (user) => user.blogs)
  createdBy: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs, { nullable: true })
  @JoinTable()
  tags: Tag[];
}

export default Blog;
