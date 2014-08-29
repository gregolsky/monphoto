var _ = require('lodash'),
moment = require('moment'),
Q = require('q');

var PhotoOrganizer = function (fileManager, exifReader) {
  this._fileManager = fileManager;
  this._exifReader = exifReader;
};

PhotoOrganizer.prototype.organize = function (sourceDir, targetDir) {
  var self = this;

  return self._fileManager.list(sourceDir)
  .then(function (files) {

    var photos = _.filter(files, function (file) {
      return self._fileManager.extension(file) == '.jpg';
    });

    return Q.all(_.map(photos, function (photoFile) {
      return self.organizeFile(photoFile, sourceDir, targetDir);
    }));
  });
};

PhotoOrganizer.prototype.organizeFile = function (file, sourceDir, targetDir) {

  var self = this;
  var subdirPath;
  var srcPath = self._fileManager.join(sourceDir, file);

  return self._exifReader.read(srcPath)
    .then(function (exifData) {
       var subdir = moment(exifData.createDate).format('YYYY-MM');                                         
       subdirPath = self._fileManager.join(targetDir, subdir);
       return self._fileManager.exists(subdirPath);
    })
    .then(function (subdirExists) {
      if (!subdirExists) {
        return self._fileManager.makeDirectory(subdirPath);
      }
    })
    .then(function () {
      var newPath = self._fileManager.join(subdirPath, file);
      return self._fileManager.rename(srcPath, newPath);
    });
};

module.exports = PhotoOrganizer;
