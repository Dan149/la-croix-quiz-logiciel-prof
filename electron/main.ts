import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "node:path";

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
