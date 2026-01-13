import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";

import botRouter from "./routes/botsRouter";
import usersRouter from "./routes/usersRouter";
import botConfigRouter from "./routes/botConfigsRouter";
import { inviteUser } from "./controllers/inviteUserController";
import { accpetInvitation } from "./controllers/accpetInvitationController";
import handleRefreshToken from "./controllers/refreshTokenController";
import handleLogin from "./controllers/authController";
import handleLogout from "./controllers/logOutController";

import verifyJWT from "./middleware/verifyJwt";

import cookieParser from "cookie-parser";

import chatWithMe from "./controllers/chatController";
import cors from "cors";
import path from "path";

// import { users } from "./src/db/schema";

const allowedOrigins = [
  "http://127.0.0.1:5500", // frontend dev
  "http://localhost:5173", // maybe another frontend
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const app: Application = express();

app.use(cors(corsOptions));

app.use("/static", express.static(path.join(__dirname, "public")));

app.use(express.json()); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

console.log(
  process.env.DB_USER,
  process.env.DB_HOST,
  process.env.DB_NAME,
  process.env.DB_PASSWORD,
  process.env.DB_PORT
);

app.post("/auth", handleLogin);
app.get("/refreshToken", handleRefreshToken);
app.post("/auth/accepte", accpetInvitation);

// app.use(verifyJWT);     //commented just for test purposes

app.post("/auth/invite", inviteUser);

app.use("/users", usersRouter);
app.use("/bots", botRouter);
app.use("/botConfigs", botConfigRouter);

// test chat
app.post("/chat/:botId", chatWithMe);

app.get("/logout", handleLogout);

app.listen(3000, () => {
  console.log("server started on port 3000");
});
