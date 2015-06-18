var fs = require('fs');
var path = require('path');
var album = require('./lib/album');
var template = require('./lib/template');
var program = require('commander');
var package = require('./package.json');

program
  .version(package.version)
  .option('--base <directory>', 'The base directory.')
  .option('--target <directory>', 'The target directory.')
  .option('--templates <directory>', 'The templates directory.')
  .option('--force', 'Force the recreation of thumbnails/target images.')
  .option('--thumbnail <size>', 'Thumbnail size (example: 300x200).')
  .option('--normal <size>', 'Normal max width (example: 1200).')
  .parse(process.argv);

if (typeof program.base === 'undefined') {

    fatal('The base directory is not set. See --help');
}

if (!fs.existsSync(program.base)) {

    fatal('The base directory ' + program.base + ' does not exist.');
}

if (typeof program.target === 'undefined') {

    fatal('The target directory is not set. See --help');
}

if (path.resolve(program.base) === path.resolve(program.target)) {

    fatal('The target directory must be different from the base directory.');
}

if (typeof program.templates === 'undefined') {

    fatal('The templates directory is not set. See --help');
}

if (!fs.existsSync(program.templates)) {

    fatal('The templates directory does not exist.');
}

if (typeof program.thumbnail === 'undefined') {

    fatal('The thumbnail size is not set. See --help');
}

if (!program.thumbnail.match(/^\d+x\d+$/)) {

    fatal('The thumbnail size must be in the format of 300x200.');
}

if (typeof program.normal === 'undefined') {

    fatal('The normal image width is not set. See --help');
}

if (isNaN(parseInt(program.normal, 10))) {

    fatal('The normal image width must be an integer.');
}

var gallery = album.create(program.base);

gallery.postprocess(program.target, null, '/', []);

gallery.make(template.create(program.templates), {

    force: !!program.force,

    thumbnail: program.thumbnail,

    normal: program.normal
});

function fatal(message) {

    process.stderr.write(message + '\n');
    process.exit(1);
}
