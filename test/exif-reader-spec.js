describe("EXIF reader", function() {

  var ExifReader = require('../lib/exif-reader.js');

  it("should return proper created date" , function(done) {
    var self = this;

    var reader = new ExifReader();

    var exifWillBeRead = reader.read('test/data/1.jpg');

    expect(exifWillBeRead).toBeDefined();
    expect(exifWillBeRead.then).toBeDefined();

    exifWillBeRead.done(function (metadata) {
      expect(metadata).toBeDefined();
      expect(metadata).not.toBeNull();
      expect(metadata.createDate).toBeDefined();
      expect(metadata.createDate.getMonth).toBeDefined();
      expect(metadata.createDate.getMonth()).toBe(6);
      expect(metadata.createDate.getFullYear()).toBe(2014);
      done();
    }, function (error) {
      self.fail(new Error(error));
    });

  });
});
