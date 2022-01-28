// some utils for the url Shortener app

// Trying something here, generator that yields an incrementing string of some length from the alphabet
// of some length. Don't ask why I spent so long on this...
function* shortGenerator(charLength=3, strLength=3, startIdx=0) {
    if (charLength > 26) {
        throw new Error('only 26 letters available.')
    }
    let chars = Array(26).fill().map((_,i)=>String.fromCharCode(97+i));
    chars = chars.slice(0,charLength);
    for (let outerIdx = startIdx; outerIdx < charLength**strLength; outerIdx++) {
        let result = '';
        for (let innerIdx = 0; innerIdx < strLength; innerIdx++){
            result += chars[Math.floor(outerIdx/(charLength**innerIdx))%charLength]
        }
        yield result;
    }
}


// helper method for logging the urlShortcuts table to the console.
const logTable = (db) => {
    console.log('Current Table:')
    db.each('SELECT rowid AS id, url, short FROM urlShortcuts', (err, row) => {
        console.log(row.id + "\t: " + row.url + "\t" + row.short);
    });
}


const createDB = async (db) => {
    return new Promise(resolve => {
        db.serialize(() => {
            // create table first, it's in memory so it won't exist before right?
            db.run('CREATE TABLE IF NOT EXISTS urlShortcuts (url TEXT, short TEXT, UNIQUE(url, short))');
            db.all('SELECT 1 FROM urlShortcuts', (err, rows) => {
                const shortIdx = rows.length;
                resolve(shortIdx);
                logTable(db);
            })
        })
        
    })
}


// Export the methods and generator here
module.exports.shortGenerator = shortGenerator;
module.exports.logTable = logTable;
module.exports.createDB = createDB;