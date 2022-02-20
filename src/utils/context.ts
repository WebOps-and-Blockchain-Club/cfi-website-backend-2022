import User from "../entities/User";
import { Request, Response } from "express";

interface MyContext {
  req: Request;
  res: Response;
  user: User;
}

export default MyContext;
