// This file should exist in `src/common/helpers`
import fs from 'fs';
import { promisify } from 'util';

/**
 * Check if a file exists at a given path.
 *
 * @param {string} path
 *
 * @returns {boolean}
 */
export const checkIfDirectoryExists = (path: string): boolean => {
  console.log(`Checking if folder exists: ${path}`);
  return fs.existsSync(path);
};

export const renameFile = (currPath: string, newPath: string) => {
  fs.rename(currPath, newPath, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Successfully renamed the directory.")
    }
  })
};



/**
 * Gets file data from a given path via a promise interface.
 *
 * @param {string} path
 * @param {string} encoding
 *
 * @returns {Promise<Buffer>}
 */
export const getFile = async (
  path: string,
  encoding: { encoding?: null; flag?: string },
): Promise<string | Buffer> => {
  const readFile = promisify(fs.readFile);

  return encoding ? readFile(path, encoding) : readFile(path, {});
};

/**
 * Writes a file at a given path via a promise interface.
 *
 * @param {string} path
 * @param {string} fileName
 * @param {string} data
 *
 * @return {Promise<void>}
 */
export const createFile = async (
  path: string,
  fileName: string,
  data: string | NodeJS.ArrayBufferView,
): Promise<void> => {
  if (!checkIfDirectoryExists(path)) {
    fs.mkdirSync(path);
  }
  console.log(`${path}/${fileName}`);

  const writeFile = promisify(fs.writeFile);
  return await writeFile(`${path}/${fileName}`, data, 'utf8');
};

/**
 * Delete file at the given path via a promise interface
 *
 * @param {string} path
 *
 * @returns {Promise<void>}
 */
export const deleteFile = async (path: string): Promise<void> => {
  const unlink = promisify(fs.unlink);

  return await unlink(path);
};

export const moveFile = async (oldPath: string, newPath: string) => {
  fs.rename(oldPath, newPath, () => console.log('Moved a file...'));
};


// Function to get current filenames 
// in directory 
export const getCurrentFilenames = () => {
  console.log("\nCurrent filenames:");
  fs.readdirSync(__dirname).forEach(file => {
    console.log(file);
  });
  console.log("\n");
}


export function getAllFilesFromFolder(dir: string) {
  let results = [];
  if (checkIfDirectoryExists(dir)) {
    fs.readdirSync(dir).forEach(function (file) {
      file = dir + '/' + file;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFilesFromFolder(file));
      } else results.push(file);
    });
  }

  return results;
}