# Manga API
Restful API Manga bahasa Indonesia built with ❤️ and node.js

# Usage
1. Clone this repository
    ```bash
    git clone https://github.com/febryardiansyah/manga-api.git
    ```
2. Install dependecies (`yarn` or `npm install`)
3. Start the development environment (*if you haven't installed nodemon globally, you can do `npm i nodemon --save`)
    ```bash
    npm run dev or npm run start
    ```
4. visit http://localhost:3000/api

# Documentation
__API__ __PATH__ = http://localhost:3000/api
__ApI__ Version = `v1.0`

## Get All Manga
Get Latest Manga Update

```bash
/manga/page/[pageNumber]
```

Returns
```
bash
{
manga_list: [
    {
    title: "My Wife is a Demon Queen ",
    thumb: "https://i0.wp.com/komiku.co.id/wp-content/uploads/Manhua-My-Wife-is-a-Demon-Queen.jpg?resize=450,235&quality=60",
    type: "Manhua",
    updated_on: "2 jam lalu Berwarna",
    endpoint: "my-wife-is-a-demon-queen/",
    chapter: "Chapter 212"
    },
]
```
