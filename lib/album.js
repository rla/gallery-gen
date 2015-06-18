var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var assert = require('assert');
var image = require('./image');
var template = require('./template');
var debug = require('debug')('album');

// Extracts album metadata from the
// given directory.

var create = exports.create = function(dir) {

    assert(isAlbum(dir));

    var album = {

        info: readInfo(dir),

        albums: {},

        images: {},

        directory: dir,

        postprocess: function(target, title, url, breadcrumb) {

            album.title = title ? title + ' - ' + album.info.title : album.info.title;

            album.target = target;

            album.html = path.join(target, 'index.html');

            album.url = url;

            if (album.url.charAt(album.url.length - 1) !== '/') {

                album.url += '/';
            }

            album.breadcrumb = breadcrumb.concat({ url: url, title: album.info.title });

            Object.keys(album.albums).forEach(function(key) {

                album.albums[key].postprocess(
                    path.join(target, key), album.title, subUrl(url, key), album.breadcrumb);
            });

            Object.keys(album.images).forEach(function(key) {

                album.images[key].postprocess(
                    path.join(target, key), album.title, subUrl(url, key), album.breadcrumb);
            });

            album.sorted = {

                albums: Object.keys(album.albums).map(function(key) {

                    return album.albums[key];
                }),

                images: Object.keys(album.images).map(function(key) {

                    return album.images[key];
                })
            };

            album.cover = findCover(album);
        },

        make: function(templates, conf) {

            assert(album.target);
            assert(!fs.existsSync(album.html) || fs.statSync(album.html).isFile());

            debug('Mkdirp ' + album.target);

            mkdirp.sync(album.target);

            debug('Writing ' + album.html);

            fs.writeFileSync(album.html, templates.album(album), 'utf8');

            Object.keys(album.albums).forEach(function(key) {

                album.albums[key].make(templates, conf);
            });

            Object.keys(album.images).forEach(function(key) {

                album.images[key].make(templates, conf);
            });
        }
    };

    readAlbum(dir, album);

    return album;
};

function findCover(album) {

    if (typeof album.info.cover === 'string') {

        var tokens = album.info.cover.replace(/^\//, '').split(/\//);

        var current = album;

        for (var i = 0; i < tokens.length; i++) {

            var token = tokens[i];

            if (i < tokens.length - 1) {

                var sub = current.albums[token];

                if (!sub) {

                    throw new Error('Album cover ' + album.info.cover +
                        ' does not exist. ' + album.directory);
                }

                current = sub;

            } else {

                var image = current.images[token]

                if (!image) {

                    throw new Error('Album cover ' + album.info.cover +
                        ' does not exist. ' + album.directory);
                }

                return image;
            }
        }

    } else if (typeof album.info.cover === 'object') {

        throw new Error('Album cover must be a string. ' + album.directory);

    } else {

        return findCoverFirst(album);
    }
}

function findCoverFirst(album) {

    if (album.sorted.images.length > 0) {

        return album.sorted.images[0];
    }

    var image;

    for (var i = 0; i < album.sorted.albums.length; i++) {

        image = findCoverFirst(album.sorted.albums[i]);

        if (image) {

            return image;
        }
    }

    throw new Error('No index image for ' + album.directory);
}

function subUrl(url, entry) {

    return (url === '/' ? '' : url) + '/' + entry;
}

var isAlbum = exports.isAlbum = function(dir) {

    return fs.existsSync(path.join(dir, 'info.json'));
}

function readInfo(dir) {

    return JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));
}

function readAlbum(dir, album) {

    fs.readdirSync(dir).forEach(function(entry) {

        var entryPath = path.join(dir, entry);

        var stat = fs.statSync(entryPath);

        if (stat.isDirectory() && isAlbum(entryPath)) {

            album.albums[entry] = create(entryPath);

        } else if (image.isImage(entryPath)) {

            album.images[entry] = image.create(entryPath, album);
        }
    });
}
