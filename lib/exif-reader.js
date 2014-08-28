var ExifImage = require('exif').ExifImage,
    Q = require('q'),
    moment = require('moment');

var ExifReader = function () { };

ExifReader.prototype.read = function (file) {
  var q = Q.defer();

  new ExifImage({ image: file }, function (error, exifData) {
      if (error) {
        q.reject(error);
        return;
      }

      if (!exifData) {
        q.reject(new Error("EXIF data missing."));
        return;
      }

      var result = {};

      if (exifData.exif && exifData.exif.CreateDate) {
        result.createDate = moment(exifData.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss').toDate();
      }

      q.resolve(result);
      return;
  });

  return q.promise;
};

module.exports = ExifReader;
