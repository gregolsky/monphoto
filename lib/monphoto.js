
var fileManager = require('q-io/fs'),
    ExifReader = require('./exif-reader'),
    PhotoOrganizer = require('./photo-organizer');


var Monphoto = function (args) {
  this.srcDir = args[0];
  this.dstDir = args[1];
};

Monphoto.prototype.run = function () {
  var organizer = new PhotoOrganizer(fileManager, new ExifReader());
  organizer.organize(this.srcDir, this.dstDir);
};

module.exports = Monphoto;
