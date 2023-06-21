import dotenv from "dotenv";
dotenv.config();

export enum UserRole {
  ADMIN = "ADMIN",
  DEV = "DEV",
  MEMBER = "MEMBER",
  USER = "USER",
}

export enum LoginType {
  SIP = "SIP",
  BLOG = "BLOG",
  ADMIN = "ADMIN",
  SUMMERSCHOOL = "SUMMERSCHOOL",
}

export const RoleConstraints = {
  SIP: [UserRole.USER],
  Blog: [UserRole.USER],
  Admin: [UserRole.ADMIN, UserRole.DEV, UserRole.MEMBER],
  SummerSchool: [UserRole.USER],
};

export enum BlogStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED_BY_CLUB = "APPROVED_BY_CLUB",
  REJECTED_BY_CLUB = "REJECTED_BY_CLUB",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  PUBLIC = "PUBLIC",
}

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const emailRoleList =
  process.env.NODE_ENV === "production"
    ? [
        {
          email: "cfi@smail.iitm.ac.in",
          role: UserRole.ADMIN,
        },
        {
          email: "bnecfi@gmail.com",
          role: UserRole.ADMIN,
        },
        {
          email: "cfiwebops@gmail.com",
          role: UserRole.DEV,
        },
      ]
    : [
        {
          email: process.env.ADMIN_EMAIL_ID,
          role: UserRole.ADMIN,
        },
        {
          email: process.env.DEV_EMAIL_ID,
          role: UserRole.DEV,
        },
      ];

export const getAdminMails = () => {
  let arr: string[] = [];
  emailRoleList.map((_item) => arr.push(_item.email!));
  return arr;
};

export function autoGenString(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
