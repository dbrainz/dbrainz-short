var express = require('express')
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');

var app = express()
var mongoURL = "mongodb://dbrainzfcc:shortener@ds133428.mlab.com:33428/shorten" 

app.use(express.static(__dirname));

app.get('/*', (req,res) => {
    if (req.params[0].substr(0,4) == "new/") {
        var longUrl = req.params[0].substr(4)
        if (!(validUrl.isUri(longUrl))) {
            res.end(JSON.stringify({'error' : 'invalid url'}))
            return
        }
        mongo.connect(mongoURL, (err, db) => {
            if (err) throw err;
    
            db.collection('urls').find({}).sort({$natural:-1}).limit(1).toArray((err, documents) => {
                if (err) throw err;
                var newKey = Number(documents[0].url_key) + 1;
                var collection = db.collection('urls');
                var insertRec = {'url_key' :  newKey, 'url' : longUrl}
                collection.insert( insertRec, (err, data) => { 
                    if (err) throw err;
                    db.close();
                })
                res.end(JSON.stringify({'originalURL' : longUrl, 'shortURL' : 'https://dbrainz-short.herokuapp.com/' + newKey}))
            })
    

        })
    }
    else if (req.params[0].length > 0) {
        mongo.connect(mongoURL, (err, db) => {
            if (err) throw err;
                
            var collection = db.collection('urls');

            collection.findOne({url_key:  Number(req.params[0])}, function(err, document) {
                if (err) throw err;
                if (document != null) {
                    res.redirect(document.url);
                }
                else {
                    res.end(JSON.stringify({ 'error' : 'url not in database'}));
                }
            });
        })
        
    }
    else {
        express.static("index.html");
    }
    
})

app.listen(process.env.PORT || 3000 || 8080);