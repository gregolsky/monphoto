const assert = require('assert');
const mockFs = require('mock-fs');
const { PhotoOrganizer } = require('../lib/photo-organizer');
const moment = require('moment');
const sortby = require('lodash.sortby');
const path = require('path');

assert.ok(PhotoOrganizer);

describe('Photo organizer', function () {
    const testDates = {
        'a/b/c.jpg': new Date(2014, 5, 5),
        'a/b/d.jpg': new Date(2014, 6, 5),
        'a/b/e.jpg': new Date(2014, 7, 5)
    };

    let fs;

    beforeEach(async function () {
        mockFs({
            a: {
                b: {
                    'c.jpg': 'asdf',
                    'd.jpg': 'asdf',
                    'e.jpg': 'asdf',
                    'x.txt': 'sdfhs'
                }
            },
            target: { }
        });

        fs = require('fs');
    });

    afterEach(async function () {
        fs = null;
        mockFs.restore();
    });

    var exifReaderFake = {
        async read (file) {
            return testDates[file];
        }
    };

    it('organizes all photo files into month directories', async function () {
        var organizer = new PhotoOrganizer(mockFs, exifReaderFake, 'a/b', 'target');

        var files = sortby(Object.keys(testDates), x => x);
        var dirNames = sortby(Object.values(testDates)
            .map((date) => moment(date).format('YYYY-MM')), x => x);

        const monthDirNames = {};
        for (let i = 0; i < files.length; i++) {
            monthDirNames[files[i]] = dirNames[i];
        }

        await organizer.organize();
        const targetDirContents = fs.readdirSync('target');
        assert.strictEqual(targetDirContents.length, 3);

        for (const expected of [
            ['2014-06', 'c'],
            ['2014-07', 'd'],
            ['2014-08', 'e']
        ]) {
            assert.notStrictEqual(targetDirContents.indexOf(expected[0]), -1);
            const actualFiles = fs.readdirSync(path.join('target', expected[0]));
            assert.strictEqual(actualFiles.length, 1);
            assert.strictEqual(actualFiles[0], `${expected[1]}.jpg`);
        }
    });
});
