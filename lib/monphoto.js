const { ExifReader } = require('./exif');
const { PhotoOrganizer } = require('./photo-organizer');

class Monphoto {
    constructor (srcDir, dstDir) {
        if (!srcDir || !dstDir) {
            throw new Error(`Invalid arguments: '${srcDir}' '${dstDir}'`);
        }

        this.srcDir = srcDir;
        this.dstDir = dstDir;
    }

    async run () {
        var organizer = new PhotoOrganizer(
            new ExifReader(), this.srcDir, this.dstDir);
        await organizer.organize();
    }
}

module.exports = { Monphoto };
