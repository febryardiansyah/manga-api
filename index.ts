import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from "express";
const app = express();
const PORT = process.env.PORT || 3000;
import manga from "./routers/manga";
import chapter from "./routers/chapter";
import cors from "cors";
import helmet from "helmet";

app.use(cors());
app.use(helmet());
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);
app.use("/api", (_req: Request, res: Response) => {
  res.send({
    status: true,
    message:
      "For more info, check out https://github.com/febryardiansyah/manga-api",
    find_me_on: {
      facebook: "https://www.facebook.com/febry.ardiansyah.792/",
      instagram: "https://instagram.com/febry_ardiansyah24",
      github: "https://github.com/febryardiansyah/manga-api",
    },
  });
});
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});

app.listen(PORT, () => {
  console.log("Listening on PORT:" + PORT);
});