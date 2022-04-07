import * as fs from "fs";
import path from "path";
import { IMAGE_EXTENSIONS } from "./config";

const initDir = () => {
  /********** Creating the directory if not exists **********/
  const dirPublic = path.join(__dirname, `/../../public/`);
  const dirFiles = path.join(__dirname, `/../../public/files`);
  if (!fs.existsSync(dirPublic)) {
    fs.mkdirSync(dirPublic);
  }
  if (!fs.existsSync(dirFiles)) {
    fs.mkdirSync(dirFiles);
  }
};

const uploadFiles = async (file: any) => {
  initDir();

  // Reading the file
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const filetype = path.extname(filename);

  // Checking the extenstions
  if (!IMAGE_EXTENSIONS.includes(filetype.toLowerCase()))
    throw new Error(
      `Supported file extensions are ${IMAGE_EXTENSIONS.join(", ")}`
    );

  // Generating Unique filename and file paths
  const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + filetype;
  const pathName = path.join(__dirname, `/../../public/files/${name}`);

  // Writing the file
  await stream.pipe(fs.createWriteStream(pathName));

  // Returning the file name
  return name;
};

const deleteFile = (fileName: string) => {
  fs.rmSync(__dirname + `/../../public/files/${fileName}`);
};

const fileLink = (fileName: string) => {
  return process.env.SERVER + `/files/${fileName}`;
};

export { uploadFiles, deleteFile, fileLink };
