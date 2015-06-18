# rla-gallery-gen

Photo gallery generator. Uses JSON metainfo files in the original images tree.

Features:

 * Custom templates
 * Incremental updates
 * Fixed-sized no-distortion thumbnails
 * Output directory separated from the source images directory
 * Unbounded album nesting

## Usage

    Options:

        -h, --help               output usage information
        -V, --version            output the version number
        --base <directory>       The base directory.
        --target <directory>     The target directory.
        --templates <directory>  The templates directory.
        --force                  Force the recreation of thumbnails/target images.
        --thumbnail <size>       Thumbnail size (example: 300x200).
        --normal <size>          Normal max width (example: 1200).

## Metainfo

Metainfo is stored in `info.json` files (one per directory). Supported metainfo:

```javascript
{
    "title": String,
    "description": String, // can contain HTML
    "cover": String // relative path to cover image
}
```

## Templates

See the `example-templates` directory.

## Dependencies

ImageMagick > 6.3.8 must be installed.

## Debugging

Run with `DEBUG=* rla-gallery-gen`.

## License

The MIT License. See the LICENSE file.
