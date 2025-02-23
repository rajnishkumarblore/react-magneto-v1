const { generateJSX } = require("./generateJSX");
const fs = require("fs");
const path = require("path");
const CommonUtil = require("./commonUtil");
const parser = new (require("simple-excel-to-json").XlsParser)();

let projName = "";

let indexImport = `import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import reportWebVitals from './reportWebVitals';`

const primeReactImport = `import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';`

const indexImportAdd = `ReactDOM.render(
  <React.StrictMode>
    <Router><App /></Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();`

const getIndexData = masterLayout => {
  if(masterLayout.library === 'primeReact') {
    return indexImport + '\n' + primeReactImport +'\n' + indexImportAdd
  } else {
    return indexImport + '\n' + indexImportAdd
  }
}

const generateJSXFile = async (masterLayout) => {
  const result = await generateJSX(masterLayout);
  return result;
};

const readExcelFile = () => {
  // .xlsx file path
  const filePath = path.join(__dirname, "ui1.xlsx");

  // parsing excel file
  var data = parser.parseXls2Json(filePath, {
    isNested: true,
  });

  // selecting the sheet
  const materialUiSheet = data[0];
  let masterLayout = CommonUtil.createMasterLayout(materialUiSheet);
  return masterLayout;
};

const reactGenerator = async () => {
  return new Promise((resolve, reject) => {
    const directory = "./output/";
    fs.mkdir(directory, (err) => {
      if (err) {
        console.log("error while creating project directory -1");
      } else {
        const masterLayout = readExcelFile();

        projName = masterLayout.componentName;

        fs.mkdir(`./output/${projName}`, (err) => {
          if (err) {
            console.log("error while creating project directory -2");
          } else {
            console.log("project directory created");
            const dirName = __dirname;
            fs.mkdir(`./output/${projName}/src`, (err) => {
              if (err) {
                console.log("error while creating src directory -3");
              } else {
                console.log("src directory created");

                fs.copyFile(
                  `${dirName}/template/App.css`,
                  `./output/${projName}/src/App.css`,
                  (err) => {
                    if (err) throw err;
                  }
                );

                fs.copyFile(
                  `${dirName}/template/App.js`,
                  `./output/${projName}/src/App.js`,
                  (err) => {
                    if (err) throw err;
                  }
                );

                // fs.copyFile(`${dirName}/template/index.js`, `./output/${projName}/src/index.js`, (err) => {
                //   if (err) throw err;
                // });

                fs.writeFile(`./output/${projName}/src/index.js`, getIndexData(masterLayout), (err) => {
                  if (err) throw err;
                });

                fs.copyFile(
                  `${dirName}/template/reportWebVitals.js`,
                  `./output/${projName}/src/reportWebVitals.js`,
                  (err) => {
                    if (err) throw err;
                  }
                );

                fs.mkdir(`./output/${projName}/public`, (err) => {
                  if (err) {
                    console.log("error while creating src directory -4");
                  } else {
                    console.log("public directory created");
                    fs.copyFile(
                      `${dirName}/template/index.html`,
                      `./output/${projName}/public/index.html`,
                      (err) => {
                        if (err) throw err;

                        generateJSXFile(masterLayout).then((data) => {
                          fs.writeFile(
                            path.join(
                              `./output/${projName}/src/`,
                              `${projName}.js`
                            ),
                            data,
                            (err) => {
                              // throws an error, you could also catch it here
                              if (err) throw err;

                              // the file was saved
                              console.log("jsx file contents written");
                              resolve();
                            }
                          );
                        });
                      }
                    );
                  }
                });

                //generate package.json
                fs.readFile(
                  `${dirName}/template/package.json`,
                  "utf8",
                  (err, data) => {
                    if (err) throw err;
                    let pkg = data.replace("<app-name>", projName);
                    fs.writeFile(
                      `./output/${projName}/package.json`,
                      pkg,
                      (err) => {
                        if (err) throw err;
                      }
                    );
                  }
                );

                // fs.copyFile(`${dirName}/template/package.json`, `./output/${projName}/package.json`, (err) => {
                //   if (err) throw err;
                // });

                //generate Home.js
                fs.readFile(
                  `${dirName}/template/Home.js`,
                  "utf8",
                  (err, data) => {
                    if (err) throw err;
                    let pkg = data.replace(/<app-name>/g, projName);
                    fs.writeFile(
                      `./output/${projName}/src/Home.js`,
                      pkg,
                      (err) => {
                        if (err) throw err;
                      }
                    );
                  }
                );

                // fs.copyFile(`${dirName}/template/package.json`, `./output/${projName}/package.json`, (err) => {
                //   if (err) throw err;
                // });

                // fs.copyFile(`${dirName}/template/.gitignore`,`./output/${projName}/.gitignore`, err => {
                //     if (err) throw err
                // })
              }
            });
          }
        });
      }
    });
  });
};

module.exports = { reactGenerator };
