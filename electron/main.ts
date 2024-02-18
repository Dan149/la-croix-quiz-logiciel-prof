import { app, BrowserWindow, ipcMain, session } from "electron";
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
let sessionType = "";
let globalQuizFilePath = "";
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

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
