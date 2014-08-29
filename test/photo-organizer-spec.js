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

  it('organizes all photo files into month directories', function (done) {
    var organizer = new PhotoOrganizer(mockFs, exifReaderFake);

    var same = function (x) { return x; };
    var files = _.sortBy(_.keys(testDates), same);
    var dirNames = _(_.values(testDates))
      .map(function (date) {
        return moment(date).format('YYYY-MM');
      })
      .sortBy(same)
      .value();

    var monthDirNames = _.zipObject(files, dirNames);

    organizer.organize('a/b', 'target')
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
