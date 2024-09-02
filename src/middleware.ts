import { NextFunction, Request, Response } from "express";
import { ISession, UserRole } from "./types";

export const checkSession = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as ISession;
    console.log(session);
    if (!session || !session.username) {
      return res.status(401).json({ message: "no valid session found" });
    }
    next();
  };
};

export const checkRole = (requiredRole: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};
