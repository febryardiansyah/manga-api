import { Router, Request, Response } from "express";
const router = Router();
import cheerio from "cheerio";
import AxiosService from "../helpers/axiosService";
import type { ChapterDetail, ChapterImage } from "../types";

router.get("/", (_req: Request, res: Response) => {
  res.send({
    message: "chapter"
  });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  try {
    const response = await AxiosService(`${slug}/`);
    const $ = cheerio.load(response.data as string);
    const content = $("#article");
    let chapter_image: ChapterImage[] = [];
    const obj: ChapterDetail = {
      chapter_endpoint: slug + "/",
      chapter_name: slug.split('-').join(' ').trim(),
      title: '',
      chapter_pages: 0,
      chapter_image: []
    };

    obj.title = $('#Judul > header > p > a > b').text().trim()

    const getTitlePages = content.find(".dsk2")
    let foundTitle = $(getTitlePages).find("h1").text().replace("Komik ", "");
    if (foundTitle) {
      obj.title = foundTitle;
    }

    const getPages = $('#Baca_Komik > img')

    obj.chapter_pages = getPages.length;
    getPages.each((i, el) => {
      chapter_image.push({
        chapter_image_link: $(el).attr("src")?.replace('i0.wp.com/','') ?? '',
        image_number: i + 1,
      });
    });
    obj.chapter_image = chapter_image;
    res.json(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
      chapter_image: []
    });
  }
});

export default router;