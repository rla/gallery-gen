var fs = require('fs');
var path = require('path');
var assert = require('assert');
var execFileSync = require('child_process').execFileSync;
var debug = require('debug')('image');

// Reads and sets the image metadata.

exports.create = function(file, album) {

    assert(isImage(file));

    var image = {

        file: file,

        description: album.info.description,

        album_title: album.info.title,

        postprocess: function(target, title, url, breadcrumb) {

            image.target = target;

            image.title = title;

            image.url = url;

            image.html = {

                file: target.replace(/\.[^\.]+$/, '.html'),

                url: url.replace(/\.[^\.]+$/, '.html')
            };

            image.thumbnail = {

                file: target.replace(/\.[^\.]+$/, '.th$&'),

                url: url.replace(/\.[^\.]+$/, '.th$&')
            };

            image.normal = { file: target, url: url };

            image.breadcrumb = breadcrumb;
        },

        make: function(templates, conf) {

            var originalStat = fs.statSync(image.file);

            if (fs.existsSync(image.thumbnail.file)) {

                var thumbnailStat = fs.statSync(image.thumbnail.file);

                if (conf.force || originalStat.mtime.getTime() > thumbnailStat.mtime.getTime()) {

                    createThumbnail(image, conf);
                }

            } else {

                createThumbnail(image, conf);
            }

            if (fs.existsSync(image.normal.file)) {

                var normalStat = fs.statSync(image.normal.file);

                if (conf.force || originalStat.mtime.getTime() > normalStat.mtime.getTime()) {

                    createNormal(image, conf);
                }

            } else {

                createNormal(image, conf);
            }

            debug('Writing ' + image.html.file);

            fs.writeFileSync(image.html.file, templates.image(image), 'utf8');
        }
    };

    return image;
};

// Checks that the file path
// is for an image.

var isImage = exports.isImage = function(path) {

    return path.match(/\.(jpg|png|gif)$/i);
};

function createThumbnail(image, conf) {

    debug('Converting ' + image.file + ' to ' + image.thumbnail.file);

    var args = [image.file, '-auto-orient', '-resize', conf.thumbnail + '^',
        '-gravity', 'center', '-extent', conf.thumbnail, '-strip', image.thumbnail.file];

    execFileSync('convert', args);
}

function createNormal(image, conf) {

    debug('Converting ' + image.file + ' to ' + image.normal.file);

    var args = [image.file, '-auto-orient',
        '-resize', conf.normal + '>', '-strip', image.normal.file];

    execFileSync('convert', args);
}
