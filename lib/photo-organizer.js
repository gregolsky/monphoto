var moment = require('moment'),
Q = require('q');

var PhotoOrganizer = function (fileManager, exifReader, sourceDir, targetDir) {
  this._fileManager = fileManager;
  this._exifReader = exifReader;
  this._sourceDir = sourceDir;
  this._targetDir = targetDir;
  this._fileToDir = {};
};

PhotoOrganizer.prototype.organize = function () {
  var self = this;

  var sourceDir = this._sourceDir,
  targetDir = this._targetDir;

  return self._fileManager.list(sourceDir)
  .then(function (files) {

    var photos = files.filter(function (file) {
      return self._fileManager.extension(file) == '.jpg';
    });

    return Q.all(photos.map(function (photoFile) {
      return self.organizeFile(photoFile);
    }));
  });
};

PhotoOrganizer.prototype.useExifDataToMkdir = function (file, exifData) {
  var subdir = moment(exifData.createDate).format('YYYY-MM');                                         
  var subdirPath = this._fileManager.join(this._targetDir, subdir);

  this._fileToDir[file] = subdirPath;

  return this._fileManager.makeDirectory(subdirPath);
};

PhotoOrganizer.prototype.moveFileToCreateDir = function (file, srcPath) {
  var monthDir = this._fileToDir[file];
  var dstPath = this._fileManager.join(monthDir, file);
  return this._fileManager.rename(srcPath, dstPath);
};

var ignoreDirExistError = function (error) {
    if (error.code == 'EEXIST') {
      return;  
    }

    throw error;
};

PhotoOrganizer.prototype.organizeFile = function (file) {
  var self = this;
  var srcPath = self._fileManager.join(self._sourceDir, file);

  return self._exifReader.read(srcPath)
  .then(function (data) {
    return self.useExifDataToMkdir(file, data);
  })
  .fail(ignoreDirExistError)
  .then(function () {
    return self.moveFileToCreateDir(file, srcPath);
  });
};

module.exports = PhotoOrganizer;
