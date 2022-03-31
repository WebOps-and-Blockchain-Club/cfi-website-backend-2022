export enum UserRole {
  ADMIN = "ADMIN",
  DEV = "DEV",
  MEMBER = "MEMBER",
  USER = "USER",
}

export enum BlogStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum Club {
  THREED_PRINTING_CLUB = "3D Printing Club",
  AERO_CLUB = "Aero Club",
  ANALYTICS_CLUB = "Analytics Club",
  CVI = "Computer Vision and Intelligence Club",
  ELECTRONICS_CLUB = "Electronics Club",
  HORIZON = "Horizon",
  IBOT = "iBot Club",
  IGEM = "iGEM",
  PRODUCT_DESIGN_CLUB = "Product Design Club",
  PROGRAMMING_CLUB = "Programming Club",
  TEAM_SAHAAY = "Team Sahaay",
  TEAM_ENVISAGE = "Team Envisage",
  WEBOPS_AND_BLOCKCHAIN_CLUB = "Webops and Blockchain Club",
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
