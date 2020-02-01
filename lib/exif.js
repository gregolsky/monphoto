const { ExifImage } = require('exif');
const moment = require('moment');

class ExifReader {
    async read (file) {
        const exifData = await getExifData(file);
        if (!exifData) {
            throw new Error('EXIF data missing.');
        }

        var result = {};

        if (exifData.exif && exifData.exif.CreateDate) {
            result.createDate = moment(exifData.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss').toDate();
        }

        return result;
    }
}

async function getExifData (file) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-new
        new ExifImage({
            image: file
        }, function (err, exifData) {
            if (err) return reject(err);
            resolve(exifData);
        });
    });
}

module.exports = {
    ExifReader
};
