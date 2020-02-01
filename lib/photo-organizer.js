const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);

class PhotoOrganizer {
    constructor (fileManager, exifReader, sourceDir, targetDir) {
        this._fileManager = fileManager;
        this._exifReader = exifReader;
        this._sourceDir = sourceDir;
        this._targetDir = targetDir;
    }

    async organize () {
        const files = await readdir(this._sourceDir);

        var photos = files.filter(
            x => (path.extname(x) || '').toLowerCase() === '.jpg');

        const WORKERS_NUMBER = 20;

        for (let i = 0; i < photos.length; i = i + WORKERS_NUMBER) {
            await Promise.all(
                photos.map(
                    photoFile => this._organizeFile(photoFile)));
        }
    }

    async _createMonthDirIfNeeded (createDate) {
        var subdir = moment(createDate).format('YYYY-MM');
        var subdirPath = path.join(this._targetDir, subdir);

        try {
            await stat(subdirPath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await mkdir(subdirPath);
            } else {
                throw err;
            }
        }

        return subdirPath;
    }

    async _moveFileToCreateDir (file, srcDir, dstDir) {
        const src = path.join(srcDir, file);
        const dst = path.join(dstDir, file);
        console.log(src, '=>', dst);
        await rename(src, dst);
    }

    async _organizeFile (file) {
        const srcPath = path.join(this._sourceDir, file);
        const data = await this._exifReader.read(srcPath);
        const subdir = await this._createMonthDirIfNeeded(data);
        await this._moveFileToCreateDir(file, this._sourceDir, subdir);
    }
}

module.exports = { PhotoOrganizer };
