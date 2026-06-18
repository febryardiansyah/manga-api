export interface MangaListItem {
  title: string;
  thumb: string;
  type: string;
  updated_on: string;
  endpoint: string;
  chapter?: string;
}

export interface SearchResult {
  title: string;
  thumb: string;
  type: string;
  endpoint: string;
  updated_on: string;
}

export interface GenreItem {
  genre_name: string;
  endpoint: string;
}

export interface GenreDetailItem {
  title: string;
  type: string;
  thumb: string;
  endpoint: string;
}

export interface PopularItem {
  title: string;
  type: string;
  thumb: string;
  endpoint: string;
  upload_on: string;
  sortDesc: string;
}

export interface RecommendedItem {
  title: string;
  chapter?: string;
  type?: string;
  thumb: string;
  endpoint: string;
  update?: string;
}

export interface ChapterImage {
  chapter_image_link: string;
  image_number: number;
}

export interface ChapterDetail {
  chapter_endpoint: string;
  chapter_name: string;
  title: string;
  chapter_pages: number;
  chapter_image: ChapterImage[];
}

export interface MangaDetailChapter {
  chapter_title: string;
  chapter_endpoint: string;
}

export interface MangaDetail {
  title: string;
  type: string;
  author: string;
  status: string;
  manga_endpoint: string;
  thumb?: string;
  genre_list: { genre_name: string }[];
  synopsis: string;
  chapter: MangaDetailChapter[];
}

export interface ManhuaManhwaItem {
  title: string;
  thumb: string;
  type: string;
  updated_on: string;
  endpoint: string;
  chapter?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  manga_list?: T[];
  list_genre?: T[];
  chapter_image?: T[];
}

export interface ErrorResponse {
  status: false;
  message: string | unknown;
  manga_list?: [];
  chapter_image?: [];
}