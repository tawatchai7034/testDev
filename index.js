const fs = require("fs");
const JSZip = require("jszip");

const zip = new JSZip();
const textPart = "./text";
const zipPart = "./zip";

// Recursive function to get files
function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files);
    } else {
      // If it is a file, push the full path to the files array
      files.push(name);
    }
  }
  return files;
}

// create zip file
function zipFile(part, filename) {
  try {
    const pdfData = fs.readFileSync(part);
    const dictory = zipPart + "/" + filename + ".zip";
    // add file in zip
    zip.file(filename + ".txt", pdfData);
    // generate zip file
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(dictory))
      .on("finish", function () {
        // console.log(filename + ".zip written.");
      });
  } catch (err) {
    console.error(err);
  }
}

try {
  const textInTheFolder = getFiles(textPart);
  let fileNameList = [];
  if (textInTheFolder.length > 0) {
    textInTheFolder.forEach((e) => {
      // set file name
      let list = e.split("/");
      let list2 = list[2].split(".");
      let filename = list2[0];
      fileNameList.push(filename);

      zipFile(e, filename);
    });
  }

  const zipInTheFolder = getFiles(zipPart);
  if (fileNameList.length > 0) {
    fileNameList.forEach(async (item) => {
      // get file part in deictory
      const textItem = textInTheFolder.find(
        (e) => e == "./text/" + item + ".txt"
      );
      const zipItem = zipInTheFolder.find((e) => e == "./zip/" + item + ".zip");
      // sync file
      const textStat = fs.statSync(textItem);
      const zipStat = fs.statSync(zipItem);
      //show data
      let text1 = item + ".txt: " + textStat.size + " bytes";
      let text2 = item + ".zip: " + zipStat.size + " bytes";
      console.log(text1, text2);
    });
  }
} catch (err) {
  console.error(err);
}
