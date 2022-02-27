import { UserRole } from "../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}

export default User;
