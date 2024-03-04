import { app, BrowserWindow, ipcMain, session, webContents } from "electron";
import path from "node:path";
const { dialog } = require("electron");

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

let win: BrowserWindow | null;
let sessionType: string = "";
let globalQuizFilePath: string = "";
let quizJSONConfig: string = "";
let QuizAPIServerPort: number = 3333;
let winWebContents: any = null;
// API server init:
const express: any = require("express");
const cors: any = require("cors");
const APIServer = express();
let runningAPIServer: any = null;
let allowClientQuizStart = false;
APIServer.use(cors());
APIServer.use(express.json());

const usersData = [];
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const startQuizAPIServer = () => {
  const port = QuizAPIServerPort;
  APIServer.get("/is-quiz-started", (req: any, res: any) => {
    // res.json({ quizStartAllowed: allowClientQuizStart });
    res.send(allowClientQuizStart);
  });
  APIServer.post("/join-session", (req: any, res: any) => {
    const newUserId = usersData.length;
    res.send(`${newUserId}`);
    usersData.push({
      nom: req.body.nom,
      prenom: req.body.prenom,
      id: newUserId,
    });
    console.log(usersData);
  });
  runningAPIServer = APIServer.listen(port, () => {
    winWebContents.send("get-quiz-API-server-status", {
      type: "info",
      message: `Le serveur du quiz est ouvert sur le port [${port}].`,
    });
    // type: "info" / "erreur" / "attention"
  });
};

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "/img/favicon.png"),
    title: "La Croix Quiz",
    minHeight: 550,
    minWidth: 425,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  //win.setMenu(null);
  const webContents = win.webContents;
  winWebContents = win.webContents;

  ipcMain.on("get-app-version", async () => {
    webContents.send("receive-app-version", app.getVersion());
  });

  ipcMain.on("set-session-type", (event, sessiontype) => {
    sessionType = sessiontype;
    webContents.send("receive-session-type", sessionType);
  });

  ipcMain.on("get-session-type", () => {
    webContents.send("receive-session-type", sessionType);
  });

  ipcMain.on("export-quiz-JSON", (event, JSONString: string) => {
    dialog
      .showSaveDialog({
        filters: [{ name: "JSON file", extensions: ["json"] }],
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
          const fs = require("node:fs");
          fs.writeFile(exportFilePath, JSONString, (err: any) => {
            if (err) {
              console.error(err);
            } else {
              quizJSONConfig = JSONString;
              globalQuizFilePath = exportFilePath;
              webContents.send(
                "receive-global-quiz-file-path",
                globalQuizFilePath
              );
            }
          });
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  });

  ipcMain.on("import-json-quiz-file", () => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "JSON file", extensions: ["json"] }],
      })
      .then((res: any) => {
        if (res.filePaths.length === 1) {
          globalQuizFilePath = res.filePaths[0];
          const fs = require("node:fs");
          fs.readFile(globalQuizFilePath, "utf8", (err: any, data: string) => {
            if (err) {
              console.error(err);
            } else {
              quizJSONConfig = data;
              webContents.send("receive-json-quiz-file", quizJSONConfig);
            }
          });
        }
      });
  });

  ipcMain.on("get-global-quiz-file-path", () => {
    webContents.send("receive-global-quiz-file-path", globalQuizFilePath);
  });

  ipcMain.on("get-json-quiz-file", () => {
    webContents.send("receive-json-quiz-file", quizJSONConfig);
  });

  ipcMain.on("start-quiz-API-server", () => startQuizAPIServer());

  ipcMain.on("stop-quiz-API-server", () => {
    webContents.send("get-quiz-API-server-status", {
      type: "info",
      message: "Fermeture du  serveur...",
    });
    try {
      runningAPIServer.close();
      allowClientQuizStart = false;
      webContents.send("get-quiz-API-server-status", {
        type: "info",
        message: "Serveur de session quiz fermé.",
      });
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
