const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const xmlH = process.env.XML_HEADER;
const fXml = process.env.FAILURE_XML;
const fw = process.env.FILE_WIDTH;
const fs = require('fs');
const get = require('./reqGet');
const fUtil = require('./fileUtil');

function saveNew(data) {
	const id = fUtil.getNextFileId('char-', '.xml');
	fs.writeFileSync(fUtil.getFileIndex('char-', '.xml', id), data);
	return id;
}

module.exports = {
	/**
	 * @param {number} id
	 * @returns {Promise<string>}
	 */
	load(id) {
		return new Promise((res, rej) => {
			let i = id.indexOf('-');
			let prefix = id.substr(0, i);
			let suffix = id.substr(i + 1);

			switch (prefix) {
				case 'c':
					fs.readFile(fUtil.getFileIndex('char-', '.xml', id),
						{ encoding: "utf-8" }, (e, s) => e ? rej(e) : res(s));
					break;

				case 'a':
				case '': // Blank spot is left for compatibility purposes.
					const nId = Number.parseInt(suffix);
					const xmlSubId = nId % fw, fileId = nId - xmlSubId;
					const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
					const url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;

					get(url).then(b => {
						var line = b.toString('utf8').split('\n').
							find(v => v.substr(0, xNumWidth) == lnNum);
						line ? res(xmlH + line.substr(xNumWidth)) : rej(fXml);
					}).catch(e => rej(fXml));
			}
		});
	},
	save(data, id) {
		return new Promise((res, rej) => {
			if (id) {
				let i = id.indexOf('-'), prefix = id.substr(0, i), suffix = id.substr(i + 1);
				if (prefix == 'c')
					return fs.writeFile(fUtil.getFileIndex('char-', '.xml', suffix), data, e => e ? rej() : res(id));
				else res(saveNew(data));
			}
			else res(saveNew(data));
		});
	},
}