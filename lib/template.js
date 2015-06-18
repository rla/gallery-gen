var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

exports.create = function(dir) {

    var album = path.join(dir, 'album.ejs');

    var image = path.join(dir, 'image.ejs');

    if (!fs.existsSync(album)) {

        throw new Error('Album template does not exist.');
    }

    if (!fs.existsSync(image)) {

        throw new Error('Image template does not exist.');
    }

    return {

        album: ejs.compile(fs.readFileSync(album, 'utf8'), {
                encoding: 'utf8', filename: album, rmWhitespace: true }),

        image: ejs.compile(fs.readFileSync(image, 'utf8'), {
                encoding: 'utf8', filename: image, rmWhitespace: true })
    };
};
