"use strict";

const fs = require("fs");
const path = require("path");
const NULL_BYTE = 0x00;
const NULL_BYTE_BUFFER = Buffer.from([NULL_BYTE]);
class FileStore {
  constructor(options) {
    this._root = options.root;
  }
  async get(key) {
    try {
      const data = await fs.promises.readFile(this._getFilePath(key));
      if (data[0] === NULL_BYTE) {
        return data.slice(1);
      }
      return JSON.parse(data.toString("utf8"));
    } catch (err) {
      if (err.code === "ENOENT" || err instanceof SyntaxError) {
        return null;
      }
      throw err;
    }
  }
  async set(key, value) {
    const filePath = this._getFilePath(key);
    try {
      await this._set(filePath, value);
    } catch (err) {
      if (err.code === "ENOENT") {
        fs.mkdirSync(path.dirname(filePath), {
          recursive: true,
        });
        await this._set(filePath, value);
      } else {
        throw err;
      }
    }
  }
  async _set(filePath, value) {
    let content;
    if (value instanceof Buffer) {
      content = Buffer.concat([NULL_BYTE_BUFFER, value]);
    } else {
      content = JSON.stringify(value) ?? JSON.stringify(null);
    }
    await fs.promises.writeFile(filePath, content);
  }
  clear() {
    this._removeDirs();
  }
  _getFilePath(key) {
    return path.join(
      this._root,
      key.slice(0, 1).toString("hex"),
      key.slice(1).toString("hex")
    );
  }
  _removeDirs() {
    for (let i = 0; i < 256; i++) {
      fs.rmSync(path.join(this._root, ("0" + i.toString(16)).slice(-2)), {
        force: true,
        recursive: true,
      });
    }
  }
}
module.exports = FileStore;
