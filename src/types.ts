import { Session } from "express-session";

export type UserRole = "user" | "moderator" | "admin";

export interface ISession extends Session {
  role: UserRole;
  username: string;
  clientIp: string;
  agent: string;
}
