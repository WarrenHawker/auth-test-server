import express from "express";
import cors from "cors";
import session from "express-session";
import { Request, Response } from "express";
import { users } from "./data";
import { redisClient, redisStore } from "./redis";
import { ISession, UserRole } from "./types";
import { checkRole, checkSession } from "./middleware";

const app = express();

const sessionSecret = process.env.SECRET || "";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    store: redisStore,
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    name: "sessionId",
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.get("/user", checkSession(), async (req: Request, res: Response) => {
  const username = (req.session as ISession).username;
  if (!username) {
    return res.status(400).json({ message: "no session username" });
  }
  const user = users.filter((user) => user.username == username)[0];

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  return res.status(200).json(user);
});

app.get(
  "/admin",
  checkSession(),
  checkRole("admin"),
  async (req: Request, res: Response) => {
    res.status(200).json(users);
  }
);

app.post("/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password missing" });
  }

  const user = users.filter((user) => user.username == username)[0];

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  if (user.password != password) {
    return res.status(400).json({ message: "password does not match" });
  }

  try {
    (req.session as ISession).role = user.role as UserRole;
    (req.session as ISession).username = user.username;
    (req.session as ISession).clientIp = req.socket.remoteAddress || "";
    (req.session as ISession).agent = req.headers["user-agent"] || "";
  } catch (error) {
    return res.status(500).json(error);
  }
  return res.status(200).json({ message: "sign in successful" });
});

app.post("/signout", async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Failed to sign out" });
    }
    res.clearCookie("sessionId");
    return res.status(200).json({ message: "Signout successful" });
  });
});

app.listen(5000, async () => {
  try {
    redisClient.flushAll();
    console.log(`app running on port: 5000`);
  } catch (error) {
    console.error(error);
  }
});
