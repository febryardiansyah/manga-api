const router = require("express").Router();
const cheerio = require("cheerio");
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send("chapter");
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  let link;
  try {
    //download
    let pdfResponse = await AxiosService(`https://pdf.komiku.co.id/${slug}`);
    const pdf$ = cheerio.load(pdfResponse.data);
    const element = pdf$(".title");
    link = element
      .find("a")
      .attr("href")
      .split("  ")
      .join("%20%20")
      .split(" ")
      .join("%20");
  } catch (error) {
    link = "no download link";
  }
  try {
    //response
    const response = await AxiosService(slug);
    const $ = cheerio.load(response.data);
    const content = $("#article");
    let chapter_image = [];
    const obj = {};
    obj.chapter_endpoint = slug + "/";
    content.find(".dsk2").filter(function () {
      obj.title = $(this).find("h1").text().replace("Komik ", "");
    });
    obj.download_link = link;
    obj.chapter_pages = content.find(".bc").find("img").length;
    content.find(".bc").filter(function () {
      $(this)
        .find("img")
        .each(function (i, el) {
          chapter_image.push({
            chapter_image_link: $(el).attr("src"),
            image_number: i + 1,
          });
        });
    });
    obj.chapter_image = chapter_image;
    res.json(obj);
  } catch (error) {
    console.log(error);
    res.send({ message: error });
  }
});

module.exports = router;
