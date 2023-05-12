import fs from 'fs';
import path from 'path';
import fleek from '@fleekhq/fleek-storage-js';

const apiKey = process.env.FLEEK_API_KEY;
const apiSecret = process.env.FLEEK_API_SECRET;

const testFunctionUpload = async (data) => {
  const date = new Date();
  const timestamp = date.getTime();
  console.log("input");
  console.log("input");
  console.log("input");
  const input = {
    apiKey,
    apiSecret,
    key: `file-${timestamp}`,
    data,
  };
  console.log(input);


  try {
    const result = await fleek.upload(input);
    console.log("result");
    console.log(result);
  } catch (e) {
    console.log('error', e);
  }
}

const filePath = path.join(__dirname, 'README.md');

fs.readFile(filePath, (err, data) => {
  if (!err) {
    testFunctionUpload(data);
  }
})