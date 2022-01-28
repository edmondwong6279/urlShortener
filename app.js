// Create shortened URLs- Very rusty on db stuff so please forgive my terrible sql
//
// POST /create
// request {
//     url: 'https://www.google.com'
// }
// response {
//     short: 'https://localhost:8080/abc'
// }
//
// GET /<some shortened string>
//
// Try using SQLite for some database goodness
// For the short string, the generator shortGenerator is instantiated with charLength and strLength,
// generated a string with those parameters. We have charLength^strLength number of possible
// strings to be yielded, allowing for lots of scaling (see utils for details).

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const utils = require('./utils');
const port = 3000;
const app = express();

app.use(bodyParser.json())
app.use(express.urlencoded({
  extended: true
}))

let db;
let generator;

const setUp = async () => {
    db = new sqlite3.Database('data.db');
    startIdx = await utils.createDB(db)
    generator = utils.shortGenerator(10,3,startIdx);
}

setUp();


// single method that queries for a url, or for a short.
const checkTable = async (stringToCheck, checkUrl=true) => {
    let [field1, field2] = ['url', 'short'];
    if (checkUrl) { [field1, field2] = ['short', 'url'];}
    return new Promise(resolve => {
        db.all(`SELECT ${field1} FROM urlShortcuts WHERE ${field2}=?`,stringToCheck, (err, rows) => {
            resolve(rows);
        })
    })
}


// handle for creating a new entry if one does not already exist (and if there is room).
const createHandle = async (req,res) => {
    const checkUrlResult = await checkTable(req.body.url, checkUrl=true);
    // does this url already exist?
    if (checkUrlResult.length === 0){
        const generated = generator.next().value;
        if (generated != undefined) {
            // check performed. Insert new entry first, then respond with the JSON object.
            db.run('INSERT INTO urlShortcuts (url, short) VALUES (?,?)', `${req.body.url}`, `${generated}`);
            console.log('Added entry to table.')
            utils.logTable(db);

            // respond
            res.send({short: `http://localhost:3000/${generated}`})
            return;
        } else {
            res.status(400).send('String generator no longer yielding.')
        }
    } else {
        res.status(400).send('URL shortcut already created')
    }
}


const getHandle = async (req,res) => {
    const checkShortResult = await checkTable(req.params.shortId, checkUrl=false);
    if (checkShortResult.length > 0) {
        res.redirect(checkShortResult[0].url);
    } else {
        res.status(400).send('URL shortcut does not exist.')
    }
}


// immediately call the handle method (which is an async method).
app.post('/create', (req,res)=> {
    createHandle(req,res);
});


app.get('/:shortId', (req,res)=> {
    getHandle(req,res);
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
