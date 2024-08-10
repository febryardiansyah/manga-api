require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const manga = require("./routers/manga");
const chapter = require("./routers/chapter");
const cors = require("cors");
const helmet = require("helmet");

app.use(cors());
app.use(helmet());
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);
app.use("/api", (req, res) => {
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
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});

app.listen(PORT, () => {
  console.log("Listening on PORT:" + PORT);
});
