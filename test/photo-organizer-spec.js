describe("Photo organizer", function() {

  var PhotoOrganizer = require('../lib/photo-organizer.js');
  var Q = require('q');
  var _ = require('lodash');
  var moment = require('moment');
  var MockFs = require("q-io/fs-mock");

  var testDates = {
    "a/b/c.jpg": new Date(2014, 5, 5),
    "a/b/d.jpg": new Date(2014, 6, 5),
    "a/b/e.jpg": new Date(2014, 7, 5)
  };

  var mockFs;

  expect(PhotoOrganizer).toBeDefined();

  var exifReaderFake = {
    read: function (file) {
      return Q.fcall(function () { 
        return { createDate: testDates[file] }; 
      });
    }
  };

  beforeEach(function () {
    mockFs = MockFs({
      "a": {
        "b": {
          "c.jpg": "asdf",
          "d.jpg": "asdf",
          "e.jpg": "asdf",
          "x.txt": "sdfhs"
        }
      },
      "target": { }
    });

  });

  it('retrieves exif data for all photos', function (done) {
    var organizer = new PhotoOrganizer(mockFs, exifReaderFake);

    organizer.retrieveExifData([
      'a/b/c.jpg',
      'a/b/d.jpg',
      'a/b/e.jpg'
    ])
    .then(function () {
      var dirs = organizer._filesToMonthDirNames;
      expect(_.keys(dirs).length).toBe(3);

      _.each(_.keys(dirs), function (file) {
        expect(dirs[file]).toBe(moment(testDates[file]).format('YYYY-MM'));
      });

    })
    .done(function () {
      done();
    });

  });

  it('create directories in the target directory based on months when photos were taken', function (done) {
    var organizer = new PhotoOrganizer(mockFs, exifReaderFake);
    organizer._filesToMonthDirNames = {
      'a/b/c.jpg': '2014-06',
      'a/b/d.jpg': '2014-07',
      'a/b/e.jpg': '2014-08'
    };

    organizer.createMonthSubdirectories('target')
    .then(function () {
      var actualDirs = _.keys(mockFs._root._entries['target']._entries).sort();
      var expectedDirs = _.map(_.values(testDates), function (date) {
        return moment(date).format('YYYY-MM');
      });

      expectedDirs.sort();

      expect(actualDirs.length).toBe(expectedDirs.length);
      _.each(actualDirs, function (dir, i) {
        expect(dir).toBe(expectedDirs[i]);
      });

    })
    .done(function () {
      done();
    });

  });

  it('scatters photos into respective month directories', function (done) {
    var organizer = new PhotoOrganizer(mockFs, exifReaderFake);
    var monthDirNames = organizer._filesToMonthDirNames = {
      'a/b/c.jpg': '2014-06',
      'a/b/d.jpg': '2014-07',
      'a/b/e.jpg': '2014-08'
    };

    var files = _.keys(organizer._filesToMonthDirNames);

    organizer.createMonthSubdirectories('target')
    .then(function () {
      return organizer.scatterPhotos('target');
    })
    .then(function () {
      _.each(files, function (file, i) {
        var fname = mockFs.base(file);
        var movedFile = _.keys(mockFs._root._entries['target']._entries[monthDirNames[file]]._entries)[0];
        expect(movedFile).toBe(fname);
      });
    })
    .done(function () {
      done();
    });
  });

});
