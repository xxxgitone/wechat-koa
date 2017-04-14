const fs = require('fs');
const Promise = require('bluebird');

exports.readFileAsync = function(fpath, encodnig) {
    return new Promise(function(resolve, reject) {
        fs.readFile(fpath, encodnig, function(err, content) {
            if (err) reject(err);
            else resolve(content);
        })
    })
}

exports.writeFileAsync = function(fpath, encodnig) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fpath, encodnig, function(err) {
            if (err) reject(err);
            else resolve();
        })
    })
}