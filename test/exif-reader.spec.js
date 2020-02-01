const assert = require('assert');
const { ExifReader } = require('../lib/exif');

describe('EXIF reader', function () {
    it('should return proper created date', async function () {
        var reader = new ExifReader();

        var metadata = await reader.read('test/data/1.jpg');
        assert.ok(metadata);
        assert.ok(metadata !== null);
        assert.ok(metadata.createDate);
        assert.ok(metadata.createDate.getMonth);
        assert.strictEqual(metadata.createDate.getMonth(), 6);
        assert.strictEqual(metadata.createDate.getFullYear(), 2014);
    });
});
