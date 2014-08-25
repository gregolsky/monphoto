var _ = require('lodash'),
moment = require('moment'),
Q = require('q');

var PhotoOrganizer = function (fileManager, exifReader) {
  this._fileManager = fileManager;
  this._exifReader = exifReader;
  this._filesToMonthDirNames = { };
};

PhotoOrganizer.prototype.organize = function (sourceDir, targetDir) {
  var self = this;

  return self._fileManager.list(sourceDir)
  .then(function (files) {

    var photos = _.filter(files, function (file) {
      return self._fileManager.extension(file) == 'jpg';
    });

    return self.retrieveExifData(photos);
  })
  .then(function () {
    return self.createMonthSubdirectories(targetDir);
  })
  .then(function () {
    return self.scatterPhotos(targetDir);
  });
};

PhotoOrganizer.prototype.retrieveExifData = function (files) {
  var self = this;

  var exifDataPromises = _.map(files, function (f) {
    return self._exifReader.read(f);
  });

  return Q.all(exifDataPromises)
  .then(function (exifData) {
    self._filesToMonthDirNames = _.object(files, _.map(exifData, function (data) {
      return moment(data.createDate).format('YYYY-MM');                                         
    }));
  });
};

PhotoOrganizer.prototype.createMonthSubdirectories = function (targetDir) {
  var self = this;
  var monthDirNames = _.uniq(_.values(self._filesToMonthDirNames));

  return Q.all(_.map(monthDirNames, function(dirName) {
    var dirPath = self._fileManager.join(targetDir, dirName);
    return self._fileManager.makeDirectory(dirPath);
  }));
};

PhotoOrganizer.prototype.scatterPhotos = function (targetDir) {
  var self = this;

  var files = _.keys(self._filesToMonthDirNames);
  return Q.all(_.map(files, function (file) {
    var name = self._fileManager.base(file);
    var monthDir = self._filesToMonthDirNames[file];
    var newPath = self._fileManager.join(targetDir, monthDir, name);
    return self._fileManager.rename(file, newPath);
  }));
};

module.exports = PhotoOrganizer;
