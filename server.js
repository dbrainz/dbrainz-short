var express = require('express')
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');

var app = express()
var mongoURL = "mongodb://dbrainzfcc:shortener@ds133428.mlab.com:33428/shorten"

app.get('/*', (req,res) => {
    if (req.params[0].substr(0,4) == "new/") {
        var longUrl = req.params[0].substr(4)
        if (!(validUrl.isHttpUri(longUrl))) {
            console.log('invalid url');
            res.end(JSON.stringify({'error' : 'invalid url'}))
            return
        }
        console.log('valid URL');
        mongo.connect(mongoURL, (err, db) => {
            if (err) throw err;
    
            db.collection('urls').find({}).sort({$natural:-1}).limit(1).toArray((err, documents) => {
                if (err) throw err;
                var newKey = documents[0].url_key + 1;
                var collection = db.collection('urls');
                var insertRec = {'url_key' :  newKey, 'url' : longUrl}
                collection.insert( insertRec, (err, data) => { 
                    if (err) throw err;
                    db.close();
                })
                console.log(JSON.stringify(insertRec))
                res.end(JSON.stringify({'originalURL' : longUrl, 'shortURL' : 'https://dbrainz-short-dbrainz.c9users.io/' + newKey}))
            })
    

        })
    }
    else {
        if (req.params[0].length > 0) {
            mongo.connect(mongoURL, (err, db) => {
                if (err) throw err;
                
                var collection = db.collection('urls');

                collection.findOne({url_key:  Number(req.params[0])}, function(err, document) {
                    if (err) throw err;
                    if (document != null) {
                        console.log(document.url_key);
                    }
                    else {
                        console.log('no record found');
                    }
                });
            })
        }
    }
})

app.listen(process.env.PORT || 3000 || 8080);