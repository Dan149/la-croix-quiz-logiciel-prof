// Avis au lecteur francophone:
//    Les commentaires de ce logiciel sont rédigés en anglais, par souci de normalisation internationale.
//    Si besoin, il est possible de me joindre au mail: danfaldev@gmail.com

import { app, BrowserWindow, ipcMain } from "electron";
import expressSession from "express-session";
import path from "node:path";
import crypto from "crypto";
import { networkInterfaces } from "os";
import fs from "node:fs";
import express from "express";
import generateDirectoryHTML from "./generateDirectoryHTML"; // blunt copy of serve-index
const { dialog } = require("electron");
const cors: any = require("cors");
const csvWriter = require("csv-writer")
const csvToObj = require("csv-to-js-parser").csvToObj;

const nets: any = networkInterfaces();

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

const userDataPath: any = app.getPath("userData");

const staticSettingsConfig = require(`${process.env.VITE_PUBLIC}/config/staticSettingsConfig`);

let win: BrowserWindow | null;
let sessionType: string = ""; // Used to render the import/create quiz on front end.
let globalQuizFilePath: string = ""; // Path of the imported quiz file conf.
let quizJSONConfig: string = ""; // JSON string of the previous file.
let parsedQuizJSONConfig: any = {}; // Object of the previous JSON var.
let QuizAPIServerPort: number = 3333; // Port on which the server runs.
let winWebContents: any = null; // webContents to use outside the window declaration, when it is already set.
let isDialogWithFileImportOpen: boolean = false; // Bool to avoid opening multiple file managers in the same time.
let sessionTime: any; // The time on which the session was started, used to deauthenticate the clients of older sessions.
let settings: any = staticSettingsConfig; // Settings of the app, set by default then mutated to user ones.
let globalUserNamesRules: UserNamesRules | undefined = undefined; // Holds the allowed students' names and surnames.
let leftUserNames: any; // Left user names to choose from.
// Strict login names:

type UserNamesRules = [
  // type of array containing the available user names, this data is acquired by reading a .csv file.
  {
    nom: string,
    prenom: string,
    password: string | undefined,
  }
];

type UserData = {
  // Type of the elements of the usersData array.
  nom: string,
  prenom: string,
  id: number,
  answersValidity: Array<boolean>, // array of bool
  hasFinished: boolean, // quiz finished or not
  openedFiles: string[], // array of shared files opened by user 
  // security:
  clientIP: string,
  sessionId: string,
};

// Checks if the app folder exists in the Documents, if it doesn't, creates it:
const userQuizDataFolderPath = `${app.getPath("documents")}/la-croix-quiz`; // Path to the said folder.

const findAppDocumentsFolder = () => {
  if (!fs.existsSync(userQuizDataFolderPath)) {
    fs.mkdir(userQuizDataFolderPath, (err: any) => console.log(err));
  }
};

// Find IP addresses of the server:

const findIPaddresses = () => {
  const availableIPs: any = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4; // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      if (net.family === familyV4Value && !net.internal) {
        if (!availableIPs[name]) {
          availableIPs[name] = [];
        }
        availableIPs[name].push(net.address);
      }
    }
  }
  // console.log(availableIPs);

  return availableIPs;
};

// Notification handling:

const createNewNotification = (title: string, message: string) => {
  return {
    title,
    message,
    time: new Date().toLocaleString(),
  };
};

const sendNotification = (notification: any) => {
  if (settings.notifications.value === "true") {
    winWebContents.send("receive-notification", notification);
  }
};

// file handling for the shared folder:

const getFiles = (dir: string, files: any = []) => {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name).forEach((file: string) => files.push(file));
    } else {
      files.push(name);
    }
  }
  return files;
}

const formatFileArrayToHTML = (files: [], hostname: string) => {
  const formatedFileArray: any = [];
  files.forEach((file: string) => {
    const fileName = file.split("partage/")[file.split("partage/").length - 1];
    formatedFileArray.push(`<li><a href="http://${hostname}:3333/partage/${fileName}">${fileName}</a></li>`)
  });
  return `<ul id="files">${formatedFileArray.toString().replaceAll(",", " ")}</ul>`;
}

// API server init:

const APIServer = express();
let runningAPIServer: any = null;
let allowClientQuizStart = false;
APIServer.use(cors());
APIServer.use(express.json());
APIServer.use(
  expressSession({
    secret: crypto.randomUUID(),
    cookie: {
      httpOnly: true,
      sameSite: true,
    },
    resave: false,
    saveUninitialized: true,
  })
);

APIServer.use(express.static(path.join(process.env.VITE_PUBLIC, "/client")));
if (!fs.existsSync(`${userQuizDataFolderPath}/partage`)) {
  fs.mkdir(`${userQuizDataFolderPath}/partage`, (err: any) => console.log(err));
}
// shared folder setup:
APIServer.use(
  "/partage",
  express.static(`${userQuizDataFolderPath}/partage`), (req: any, res: any) => {
    if (authClientIPAddress(req.socket.remoteAddress, req.session.id)) {
      fs.readFile(path.join(process.env.VITE_PUBLIC, "/directory-style.css"), 'utf8', (err: any, stylesheet: any) => {
        if (err) {
          console.error(err);
          return;
        }
        const files = formatFileArrayToHTML(getFiles(`${userQuizDataFolderPath}/partage`), req.hostname);
        res.send(generateDirectoryHTML(stylesheet, "partage", `<a href="${req.hostname}:3333/partage">/partage</a>`, files));

      });
    } else {
      res.redirect("/");
    }
  }
);

const usersData: UserData[] = [];
const votesData: any = []; // items: votes array (for each question)
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const authClientIPAddress = (clientIP: string, sessionId: string) => {
  if (clientIP === "::1" || clientIP === "::ffff:127.0.0.1") {
    return true;
  } else {
    const filteredSessionUsersData = usersData.filter(
      (user: any) => sessionId === user.sessionId
    );
    if (filteredSessionUsersData.length >= 1) {
      return true;
    } else {
      winWebContents.send("get-quiz-API-server-status", {
        type: "erreur",
        message: `Authentification utilisateur échouée sur le poste ${clientIP} !`,
      });
      return false;
    }
  }
};

const initVotesData = () => {
  votesData.length = 0;
  parsedQuizJSONConfig.forEach(() => {
    votesData.push([0, 0, 0, 0]);
  });
};

const registrerNewQuestionVote = (questionId: any, voteId: any) => {
  votesData[questionId][voteId]++;
};

const startQuizAPIServer = () => {
  sessionTime = Date.now();
  const port = QuizAPIServerPort;
  initVotesData();
  APIServer.get("/is-quiz-started", (req: any, res: any) => {
    if (authClientIPAddress(req.socket.remoteAddress, req.session.id)) {
      res.send(allowClientQuizStart);
    } else {
      res.send(false);
    }
  });
  APIServer.get("/session-time", (_req: any, res: any) => {
    res.json(sessionTime);
  });
  APIServer.post("/get-question", (req: any, res: any) => {
    if (authClientIPAddress(req.socket.remoteAddress, req.session.id)) {
      try {
        if (req.body.questionId <= parsedQuizJSONConfig.length - 1) {
          const question = parsedQuizJSONConfig[req.body.questionId];
          res.json({
            question: question.question,
            possibleAnswers: question.possibleAnswers,
          });
        } else {
          usersData[req.body.userId].hasFinished = true;
          res.send("end");
        }
      } catch {
        res.send("error");
      }
    }
  });

  APIServer.post("/register-user-answer-validity", (req: any, res: any) => {
    if (authClientIPAddress(req.socket.remoteAddress, req.session.id)) {
      try {
        usersData[req.body.userId].answersValidity[req.body.questionId] =
          parsedQuizJSONConfig[req.body.questionId].validAnswer ==
          req.body.chosenAnswerIndex; // boolean
        registrerNewQuestionVote(
          req.body.questionId,
          req.body.chosenAnswerIndex
        );
        res.send("ok");
      } catch (err) {
        res.send("error");
      }
    }
  });

  // monitoring shared files openings:

  APIServer.post("/register-file-opening", (req: any) => {
    if (req.body.userId < usersData.length) {
      if (!usersData[req.body.userId].openedFiles.includes(req.body.file)) usersData[req.body.userId].openedFiles.push(req.body.file);
    }
  })

  //

  APIServer.post("/join-session", (req: any, res: any) => {
    const newUserId = usersData.length;
    let canCreateUser = false;
    // multiple verifications before creating user:
    try {
      if (
        !usersData.some(
          (user: any) =>
            user.nom === req.body.nom && user.prenom === req.body.prenom
        )
      ) {
        if (globalUserNamesRules !== undefined) { // seen as user name selection on the client side.
          if (isStrictUserNameValid(req.body.nom, req.body.prenom, req.body.password)) {
            leftUserNames = leftUserNames.filter(
              // Stupid TS server error...
              (userName: any) =>
                userName.nom !== req.body.nom &&
                userName.prenom !== req.body.prenom
            );
            canCreateUser = true;
          }
        } else {
          canCreateUser = true;
        }
      }
      // Creating user:
      if (canCreateUser) {
        usersData.push({
          nom: req.body.nom,
          prenom: req.body.prenom,
          id: newUserId,
          answersValidity: new Array(parsedQuizJSONConfig.length), // array of bool
          hasFinished: false, // quiz finished or not
          openedFiles: [],
          // security:
          clientIP: req.socket.remoteAddress,
          sessionId: req.session.id,
        });
        res.json({ userId: newUserId, sessionTime, serverStatus: "ok" });
        winWebContents.send("get-quiz-API-server-status", {
          type: "info",
          message: `Utilisateur ${req.body.nom} ${req.body.prenom} ajouté sous l'identifiant ${newUserId}.`,
        });
      } else {
        res.json({
          serverStatus: "error",
          errorMessage: "Mot de passe incorrect ou identifiant déjà utilisé.",
        });
      }
    } catch (err: any) {
      winWebContents.send("get-quiz-API-server-status", {
        type: "erreur",
        message: "Echec de l'ajout d'un nouvel utilisateur.",
      });
    }
  });
  APIServer.get("/get-strict-usernames", (_req: any, res: any) => {
    res.send(leftUserNames);
  });
  APIServer.get("*", (_req: any, res: any) => {
    res.redirect("/");
  });
  runningAPIServer = APIServer.listen(port, () => {
    winWebContents.send("get-quiz-API-server-status", {
      type: "info",
      message: `Le serveur du quiz est ouvert sur le port [${port}].`,
    });
    // type: "info" / "erreur" / "attention"
  });
};

// App settings handling:

const createUserSettingsFile = () => {
  fs.writeFile(
    `${userDataPath}/userSettings.json`,
    JSON.stringify(settings),
    (err: any) => {
      if (err) {
        sendNotification(
          createNewNotification(
            "Erreur lors de la création du fichier de configuration",
            "Une erreur est survenue lors de la création du fichier de configuration utilisateur."
          )
        );
      }
    }
  );
};

const enableUserSettings = () => {
  let fileExists: boolean = true;
  fs.stat(`${userDataPath}/userSettings.json`, (err: any) => {
    if (err == null) {
      fileExists = true;
    } else if (err.code === "ENOENT") {
      fileExists = false;
      setTimeout(() => {
        sendNotification(
          createNewNotification(
            "Erreur de paramétrage.",
            "Le fichier de configuration utilisateur n'existe pas, utilisation de la configuration par défaut."
          )
        );
      }, 15000);
    }
  });
  if (fileExists) {
    fs.readFile(
      `${userDataPath}/userSettings.json`,
      "utf8",
      (err: any, data: string) => {
        if (err) {
          setTimeout(() => {
            sendNotification(
              createNewNotification(
                "Erreur de paramétrage.",
                "Erreur lors de la lecture du fichier de configuration utilisateur, recréation du fichier..."
              )
            );
          }, 5000);
          createUserSettingsFile();
        } else {
          settings = JSON.parse(data);
          // console.log(settings);
          setTimeout(() => {
            sendNotification(
              createNewNotification(
                "Paramètres importés.",
                "Paramètres importés à partir du fichier de configuration."
              )
            );
          }, 5000);
        }
      }
    );
  } else {
    createUserSettingsFile();
  }
};

const saveSettingsToConfFile = () => {
  fs.writeFile(
    `${userDataPath}/userSettings.json`,
    JSON.stringify(settings),
    (err: any) => {
      if (err) {
        sendNotification(
          createNewNotification(
            "Erreur sauvegarde des paramètres.",
            "Une erreur est survenue lors de la sauvegarde des paramètres."
          )
        );
      }
    }
  );
};

// Save user data to CSV:

const exportUsersDataToCSV = () => {
  const filteredUsersData: any = [];
  usersData.forEach((user) => {
    const validOnes: number = user.answersValidity.filter(Boolean).length;
    filteredUsersData.push({
      nom: user.nom,
      prenom: user.prenom,
      note: `${validOnes}/${user.answersValidity.length}`,
      status: user.hasFinished ? "Quiz fini" : "Quiz incomplet",
    });
  });

  const date = new Date();
  const path = `${userQuizDataFolderPath}/donnees-eleve-${date
    .toLocaleString()
    .replace(/[\/,\ ]/g, "-")}.csv`; // Replaces all "/" and spaces by "-".
  const writer = csvWriter.createObjectCsvWriter({
    path,
    header: [
      { id: "nom", title: "nom" },
      { id: "prenom", title: "prenom" },
      { id: "note", title: "note" },
      { id: "status", title: "status" }
    ],
  });
  writer.writeRecords(filteredUsersData).then((_out: void, err: any) => {
    if (!err) {
      sendNotification(
        createNewNotification(
          "Données élèves exportées",
          `Données exportées dans le fichier: ${path}.`
        )
      );
    }
  });
};

// Read strict student names rules from .CSV file:

const readUserNamesRulesFromCSV = async () => {
  if (!isDialogWithFileImportOpen) {
    isDialogWithFileImportOpen = true;
    const res = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "fichier CSV", extensions: ["csv"] }],
    });
    if (res.filePaths.length === 1) {
      const data = fs.readFileSync(res.filePaths[0]).toString();
      globalUserNamesRules = leftUserNames = csvToObj(data);
    }
    isDialogWithFileImportOpen = false;
  }
  return globalUserNamesRules;
};

const isStrictUserNameValid = (nom: string, prenom: string, password: string | undefined) => {
  if (leftUserNames !== undefined) {
    return (
      leftUserNames.find((userName: any) => {
        return userName.nom === nom && userName.prenom === prenom && (userName.password === password || (userName.password == undefined && password == ""));
      }) !== undefined
    ); // Checks if user name is choosable.
  }
};

// WINDOW:

async function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "/img/favicon.png"),
    title: "La Croix Quiz",
    minHeight: 550,
    minWidth: 425,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const webContents = win.webContents;
  winWebContents = win.webContents; // for outside current scope functions

  findAppDocumentsFolder(); // checks the existance of the app folder in ~/Documents

  enableUserSettings(); // enable settings from json user settings file (../public/config/userSettings.json)

  setTimeout(() => {
    if (settings.allowDebug.value === "false" && win) win.setMenu(null);
  }, 1000);

  ipcMain.on("get-app-version", async () => {
    webContents.send("receive-app-version", app.getVersion());
  });

  ipcMain.on("set-session-type", (_event, sessiontype) => {
    sessionType = sessiontype;
    webContents.send("receive-session-type", sessionType);
  });

  ipcMain.on("get-session-type", () => {
    webContents.send("receive-session-type", sessionType);
  });

  ipcMain.on("export-quiz-JSON", (_event, JSONString: string) => {
    if (!isDialogWithFileImportOpen) {
      isDialogWithFileImportOpen = true;
      dialog
        .showSaveDialog({
          filters: [{ name: "fichier JSON", extensions: ["json"] }],
        })
        .then((res: any) => {
          if (res.filePath !== undefined && res.filePath !== "") {
            let exportFilePath: string;
            if (res.filePath.split(".").length === 1) {
              exportFilePath = res.filePath + ".json";
            } else {
              if (
                res.filePath.split(".")[res.filePath.split(".").length - 1] ===
                "json"
              ) {
                exportFilePath = res.filePath;
              } else {
                exportFilePath = res.filePath + ".json";
              }
            }
            fs.writeFile(exportFilePath, JSONString, (err: any) => {
              if (err) {
                console.error(err);
              } else {
                quizJSONConfig = JSONString;
                parsedQuizJSONConfig = JSON.parse(quizJSONConfig);
                globalQuizFilePath = exportFilePath;
                webContents.send(
                  "receive-global-quiz-file-path",
                  globalQuizFilePath
                );
                sendNotification(
                  createNewNotification(
                    "Quiz exporté !",
                    "Quiz exporté avec succès."
                  )
                );
              }
            });
          }
          isDialogWithFileImportOpen = false;
        })
        .catch((err: any) => {
          sendNotification(
            createNewNotification("Erreur lors de l'export.", err)
          );
          isDialogWithFileImportOpen = false;
        });
    }
  });

  ipcMain.on("import-json-quiz-file", () => {
    if (!isDialogWithFileImportOpen) {
      isDialogWithFileImportOpen = true;
      dialog
        .showOpenDialog({
          properties: ["openFile"],
          filters: [{ name: "fichier JSON", extensions: ["json"] }],
        })
        .then((res: any) => {
          if (res.filePaths.length === 1) {
            globalQuizFilePath = res.filePaths[0];
            const fs = require("node:fs");
            fs.readFile(
              globalQuizFilePath,
              "utf8",
              (err: any, data: string) => {
                if (err) {
                  sendNotification(
                    createNewNotification("Erreur lors de l'import.", err)
                  );
                } else {
                  quizJSONConfig = data;
                  parsedQuizJSONConfig = JSON.parse(quizJSONConfig);
                  webContents.send("receive-json-quiz-file", quizJSONConfig);
                  sendNotification(
                    createNewNotification(
                      "Quiz importé !",
                      `Quiz importé du fichier ${globalQuizFilePath}.`
                    )
                  );
                }
              }
            );
          }
          isDialogWithFileImportOpen = false;
        });
    }
  });

  ipcMain.on("get-global-quiz-file-path", () => {
    webContents.send("receive-global-quiz-file-path", globalQuizFilePath);
  });
  ipcMain.on("reset-global-quiz-file-path", () => {
    globalQuizFilePath = "";
  });
  ipcMain.on("get-json-quiz-file", () => {
    webContents.send("receive-json-quiz-file", quizJSONConfig);
  });

  ipcMain.on("start-quiz-API-server", () => startQuizAPIServer());

  ipcMain.on("stop-quiz-API-server", () => {
    webContents.send("get-quiz-API-server-status", {
      type: "attention",
      message: "Fermeture du  serveur...",
    });
    try {
      runningAPIServer.close();
      allowClientQuizStart = false;
      webContents.send("get-quiz-API-server-status", {
        type: "info",
        message: "Serveur de session quiz fermé.",
      });
      usersData.length = 0;
      leftUserNames = globalUserNamesRules;
    } catch {
      webContents.send("get-quiz-API-server-status", {
        type: "erreur",
        message: "FATAL: fermeture du serveur de quiz échoué.",
      });
    }
  });

  ipcMain.on("allow-quiz-start", () => {
    try {
      allowClientQuizStart = true;
      webContents.send("get-quiz-API-server-status", {
        type: "info",
        message: "Début du quiz autorisé.",
      });
    } catch {
      webContents.send("get-quiz-API-server-status", {
        type: "erreur",
        message: "FATAL: échec d'autorisation de début du quiz.",
      });
    }
  });
  ipcMain.on("get-users-data", () => {
    webContents.send("receive-users-data", usersData);
  });
  ipcMain.on("reset-users-data", () => {
    usersData.length = 0;
  });
  ipcMain.on("get-votes-data", () => {
    webContents.send("receive-votes-data", votesData);
  });
  // Notification handling:

  ipcMain.on("add-new-notification-to-pool", (_event: any, params: any) => {
    sendNotification(createNewNotification(params.title, params.message));
  });

  ipcMain.on("call-current-notification-removal", () => {
    webContents.send("remove-current-notification", null);
  });

  // Settings handling:

  ipcMain.on("get-settings-string", () => {
    webContents.send("receive-settings-string", JSON.stringify(settings));
  });

  ipcMain.on("rewrite-settings", (_event: any, settingsString: string) => {
    settings = JSON.parse(settingsString);
    saveSettingsToConfFile();
  });

  // CSV users data export:

  ipcMain.on("export-users-data-to-csv", () => {
    if (usersData.length > 0) {
      exportUsersDataToCSV();
    }
  });

  // Get available V4 server IPs:

  ipcMain.on("get-available-IPs", () => {
    webContents.send("receive-available-IPs", findIPaddresses());
  });

  // UsersRules:

  ipcMain.on("set-users-rules", async () => {
    const usersRules = await readUserNamesRulesFromCSV();
    webContents.send("receive-users-rules", usersRules);
  });

  //

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
