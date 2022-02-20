import * as fs from "fs";
import path from "path";
import { IMAGE_EXTENSIONS } from "./config";

const uploadFiles = async (files: any) => {
  /********** Creating the directory if not exists **********/
  const dirPublic = path.join(__dirname, `/../../public/`);
  const dirFiles = path.join(__dirname, `/../../public/files`);
  if (!fs.existsSync(dirPublic)) {
    fs.mkdirSync(dirPublic);
  }
  if (!fs.existsSync(dirFiles)) {
    fs.mkdirSync(dirFiles);
  }

  let urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    /********** Reading the file **********/
    const { createReadStream, filename } = await files[i];
    const stream = createReadStream();
    const filetype = path.extname(filename);

    /********** Checking the extenstions **********/
    if (!IMAGE_EXTENSIONS.includes(filetype.toLowerCase()))
      throw new Error(
        `Supported file extensions are ${IMAGE_EXTENSIONS.join(", ")}`
      );

    /********** Generating Unique filename and file paths **********/
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + filetype;
    const pathName = path.join(__dirname, `/../../public/files/${name}`);

    /********** Writing the file **********/
    await stream.pipe(fs.createWriteStream(pathName));

    /********** Adding the file link **********/
    const url = process.env.SERVER + `files/${name}`;
    urls.push(url);
  }
  return urls;
};

export default uploadFiles;
