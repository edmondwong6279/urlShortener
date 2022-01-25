### URL Shortener

A node.js API that can create shortened URLS and 

```
POST /create
GET /<some shortened string>
```

e.g.

```
POST /create
request {
    url: 'https://www.google.com',
}
response {
    short: 'http://localhost:8080/abc'
}
```

Then in a web browser if you visit `http://localhost:8080/abc` the API should redirect you to `https://www.google.com`

I would recommend using SQLite as a lightweight SQL database, e.g. https://www.npmjs.com/package/sqlite3
