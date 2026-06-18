import { Router, Request, Response } from "express";
const router = Router();
import cheerio from "cheerio";
import { baseUrl, baseApi } from "../constants/urls";
const replaceMangaPage = "https://komiku.org/manga/";
import AxiosService from "../helpers/axiosService";
import type {
  MangaListItem,
  GenreItem,
  PopularItem,
  RecommendedItem,
  ManhuaManhwaItem,
} from "../types";

router.get("/manga/popular", async (_req: Request, res: Response) => {
  res.send({
    message: "nothing",
  });
});

router.get("/manga/page/:pagenumber", async (req: Request, res: Response) => {
  let pagenumber = req.params.pagenumber;
  let path =
    pagenumber === "1"
      ? "/komik/"
      : `/komik/page/${pagenumber}/`;
  let url = baseUrl + path;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".mk-section > .mk-grid > a");
      let manga_list: MangaListItem[] = [];

      element.each((_idx, el) => {
        const title = $(el).find(".mk-card__title").text().trim();
        const endpoint = $(el).attr("href") || "";
        const type = $(el).find(".mk-card__cover > span").text();
        const updated_on = $(el).find(".mk-card__meta > .mk-card__time").text();
        const thumb = $(el).find(".mk-card__cover > img").attr("src") || "";
        const chapter = $(el)
          .find("div.mk-card__meta > span.mk-card__chapter")
          .text();
        manga_list.push({
          title,
          thumb,
          type,
          updated_on,
          endpoint,
          chapter,
        });
      });

      return res.status(200).json({
        status: true,
        message: "success",
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

router.get("/manga/detail/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;

  try {
    const response = await AxiosService(`/manga/${slug}`);
    const $ = cheerio.load(response.data as string);
    const element = $(".perapih");
    let genre_list: { genre_name: string }[] = [];
    let chapter: { chapter_title: string; chapter_endpoint: string }[] = [];
    const obj: Record<string, any> = {};

    const getMeta = element.find(".inftable > tbody").first();
    obj.title = $("#Judul > h1").text().trim();
    obj.type = $("tr:nth-child(2) > td:nth-child(2)").find("b").text();
    obj.author = $("#Informasi > table > tbody > tr:nth-child(4) > td:nth-child(2)")
      .text()
      .trim();
    obj.status = $(getMeta).children().eq(4).find("td:nth-child(2)").text();

    obj.manga_endpoint = slug;

    obj.thumb = element.find(".ims > img").attr("src");

    element.find(".genre > li").each((_idx, el) => {
      let genre_name = $(el).find("a").text().trim();
      genre_list.push({
        genre_name,
      });
    });

    obj.genre_list = genre_list || [];

    const getSinopsis = element.find("#Sinopsis").first();
    obj.synopsis = $(getSinopsis).find("p").text().trim();

    $("#Daftar_Chapter > tbody")
      .find("tr")
      .each((_index, el) => {
        let chapter_title = $(el).find("a").text().trim();
        let chapter_endpoint = $(el).find("a").attr("href");
        if (chapter_endpoint !== undefined) {
          const rep = chapter_endpoint.replace("/ch/", "");
          chapter.push({
            chapter_title,
            chapter_endpoint: rep,
          });
        }
        obj.chapter = chapter;
      });

    res.status(200).send(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

router.get("/search/", async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const url = baseApi + `?post_type=manga&s=${query}`;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data as string);
    const element = $(".bge");
    let manga_list: MangaListItem[] = [];
    let title: string, thumb: string, type: string, endpoint: string, updated_on: string;
    element.each((_idx, el) => {
      endpoint = $(el)
        .find("a")
        .attr("href")
        ?.replace(replaceMangaPage, "")
        .replace("/manga/", "") ?? "";
      thumb = $(el).find("div.bgei > a > img").attr("data-src") ?? "";
      type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      title = $(el).find(".kan").find("h3").text().trim();
      updated_on = $(el).find("div.kan > p").text().split(".")[0]?.trim() ?? "";
      manga_list.push({
        title,
        thumb,
        type,
        endpoint,
        updated_on,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error instanceof Error ? error.message : error,
    });
  }
});

router.get("/genres", async (_req: Request, res: Response) => {
  try {
    const response = await AxiosService();

    const $ = cheerio.load(response.data as string);
    let list_genre: GenreItem[] = [];
    let obj: Record<string, any> = {};
    $("#Filter > form > select:nth-child(4)")
      .find("option")
      .each((_idx, el) => {
        if ($(el).text() !== "Genre 1") {
          const endpoint = $(el)
            .text()
            .trim()
            .split(" ")[0]
            .toLowerCase();
          list_genre.push({
            genre_name: $(el).text().trim(),
            endpoint,
          });
        }
      });
    obj.status = true;
    obj.message = "success";
    obj.list_genre = list_genre;
    res.json(obj);
  } catch (error) {
    res.send({
      status: false,
      message: error,
    });
  }
});

router.get("/genres/:slug/:pagenumber", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `/genre/${slug}/?orderby=modified&genre2&status&category_name`
      : `/manga/page/${pagenumber}/?orderby=modified&category_name&genre=${slug}&genre2&status`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data as string);
    const element = $(".bge");
    let thumb: string, title: string, endpoint: string, type: string;
    let manga_list: MangaListItem[] = [];
    element.each((_idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href")?.replace(replaceMangaPage, "") ?? "";
      type = $(el).find("div.bgei > a > div").find("b").text();
      thumb = $(el).find("div.bgei > a > img").attr("src") ?? "";
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
        updated_on: "",
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
});

router.get("/manga/popular/:pagenumber", async (req: Request, res: Response) => {
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `/other/rekomendasi/`
      : `/other/rekomendasi/page/${pagenumber}/`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data as string);
    const element = $(".bge");
    let thumb: string, title: string, endpoint: string, type: string, upload_on: string, sortDesc: string;
    let manga_list: PopularItem[] = [];
    element.each((_idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el)
        .find("a")
        .attr("href")
        ?.replace(replaceMangaPage, "")
        .replace("/manga/", "") ?? "";
      type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      thumb = $(el).find("div.bgei > a > img").attr("src") ?? "";
      sortDesc = $(el).find("div.kan > p").text().trim();
      upload_on = $(el).find("div.kan > span.judul2").text().split("•")[1]?.trim() ?? "";
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
        upload_on,
        sortDesc
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
});

router.get("/recommended/:pagenumber", async (req: Request, res: Response) => {
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `/other/hot/`
      : `/other/hot/page/${pagenumber}/`;
  const url = baseApi + path;
  try {
    const response = await AxiosService(url);

    const $ = cheerio.load(response.data as string);
    const element = $(".bge");
    let manga_list: RecommendedItem[] = [];
    element.each((_idx, el) => {
      const title = $(el).find("div.kan > a > h3").text().trim();
      const thumb = $(el).find("div.bgei > a > img").attr("src") ?? "";
      const endpoint = $(el)
        .find("div.kan > a")
        .attr("href")
        ?.replace("/manga/", "")
        .replace(replaceMangaPage, "") ?? "";
      manga_list.push({
        title,
        chapter: undefined,
        type: undefined,
        thumb,
        endpoint,
        update: undefined,
      });
    });
    return res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      message: error instanceof Error ? error.message : error,
    });
  }
});

router.get("/manhua/page/:pagenumber", async (req: Request, res: Response) => {
  await getManhuaManhwa(req, res, "manhua");
});

router.get("/manhwa/page/:pagenumber", async (req: Request, res: Response) => {
  await getManhuaManhwa(req, res, "manhwa");
});

const getManhuaManhwa = async (req: Request, res: Response, type: string) => {
  let pagenumber = req.params.pagenumber;
  let path =
    pagenumber === "1"
      ? `/manga/?orderby=&category_name=${type}&genre=&genre2=&status=`
      : `/manga/page/${pagenumber}/?orderby&category_name=${type}&genre&genre2&status`;
  const url = baseApi + path;
  try {
    console.log(url);
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data as string);
    const element = $(".bge");
    const manga_list: ManhuaManhwaItem[] = [];
    let title: string, updated_on: string, endpoint: string, thumb: string, chapter: string;

    element.each((_idx, el) => {
      title = $(el).find(".kan > a").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href")?.replace(replaceMangaPage, "") ?? "";
      type = $(el).find(".bgei > a").find(".tpe1_inf > b").text().trim();
      updated_on = $(el).find(".kan > span").text().split("• ")[1]?.trim() ?? "";
      thumb = $(el).find(".bgei > a").find("img").attr("src") ?? "";
      chapter = $(el)
        .find("div.kan > div:nth-child(5) > a > span:nth-child(2)")
        .text();
      manga_list.push({
        title,
        thumb,
        type,
        updated_on,
        endpoint,
        chapter,
      });
    });

    res.status(200).json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
};

export default router;