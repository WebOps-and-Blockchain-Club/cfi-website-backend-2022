export enum UserRole {
  ADMIN = "ADMIN",
  DEV = "DEV",
  MEMBER = "MEMBER",
  USER = "USER",
}

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const emailRoleList = [
  {
    email: "janithms9920@gmail.com",
    role: UserRole.ADMIN,
  },
  {
    email: "cfiwebops@gmail.com",
    role: UserRole.MEMBER,
  },
  {
    email: "mm19b035@smail.iitm.ac.in",
    role: UserRole.USER,
  },
];

export var salt = bcryptjs.genSaltSync(Number(process.env.ITERATIONS!));
