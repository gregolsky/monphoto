const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);

class PhotoOrganizer {
    constructor (exifReader, sourceDir, targetDir) {
        this._exifReader = exifReader;
        this._sourceDir = sourceDir;
        this._targetDir = targetDir;
    }

    async organize () {
        console.log(`Organize ${this._sourceDir} => ${this._targetDir}`);
        const files = await readdir(this._sourceDir);

        console.log('Got list of files...');

        var photos = files.filter(
            x => (path.extname(x) || '').toLowerCase() === '.jpg');

        console.log(`There's ${photos.length} to organize.`);

        const MAX_WORKERS_NUMBER = 100;

        let i = 0;
        let workers = 0;
        const promises = [];
        while (i < photos.length) {
            if (workers >= MAX_WORKERS_NUMBER) {
                await delay(30);
                continue;
            }

            workers++;

            const file = photos[i];
            promises.push((async () => {
                try {
                    await this._organizeFile(file);
                } catch (err) {
                    console.error(err.stack);
                }

                workers--;
            })());

            i++;
        }

        return Promise.all(promises);
    }

    async _createMonthDirIfNeeded ({ createDate }) {
        if (!createDate) {
            throw new Error(`Date's missing. Got: ${createDate}.`);
        }

        const subdir = moment(createDate).format('YYYY-MM');
        const subdirPath = path.join(this._targetDir, subdir);

        try {
            await stat(subdirPath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                try {
                    await mkdir(subdirPath);
                } catch (mkdirErr) {
                    if (err.code !== 'EEXIST') {
                        throw err;
                    }
                }
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

async function delay(msec) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), msec);
    });
}

module.exports = { PhotoOrganizer };
