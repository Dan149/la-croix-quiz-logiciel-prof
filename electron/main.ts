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
let parsedQuizJSONConfig: any = {};
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

const usersData: any = [];
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const startQuizAPIServer = () => {
    const port = QuizAPIServerPort;
    APIServer.get("/is-quiz-started", (req: any, res: any) => {
        res.send(allowClientQuizStart);
    });
    APIServer.post("/get-question", (req: any, res: any) => {
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
    });
    APIServer.post("/get-question-answer", (req: any, res: any) => {
        const question = parsedQuizJSONConfig[req.body.questionId];
        res.send(question.validAnswer);
    });
    APIServer.post("/register-user-answer-validity", (req: any, res: any) => {
        try {
            usersData[req.body.userId].answersValidity[req.body.questionId] =
                req.body.answerValidity; // bool
            res.send("ok");
        } catch (err) {
            res.send("error");
        }
    });
    APIServer.post("/join-session", (req: any, res: any) => {
        const newUserId = usersData.length;
        try {
            res.send(`${newUserId}`);
            usersData.push({
                nom: req.body.nom,
                prenom: req.body.prenom,
                id: newUserId,
                answersValidity: new Array(parsedQuizJSONConfig.length), // array of bool
                hasFinished: false, // quiz finished or not
            });

            winWebContents.send("get-quiz-API-server-status", {
                type: "info",
                message: `Utilisateur ${req.body.nom} ${req.body.prenom} ajouté sous l'identifiant ${newUserId}.`,
            });
        } catch (err: any) {
            winWebContents.send("get-quiz-API-server-status", {
                type: "erreur",
                message: "Echec de l'ajout d'un nouvel utilisateur.",
            });
        }
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
                            res.filePath.split(".")[
                                res.filePath.split(".").length - 1
                            ] === "json"
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
                            parsedQuizJSONConfig = JSON.parse(quizJSONConfig);
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
                    fs.readFile(
                        globalQuizFilePath,
                        "utf8",
                        (err: any, data: string) => {
                            if (err) {
                                console.error(err);
                            } else {
                                quizJSONConfig = data;
                                parsedQuizJSONConfig =
                                    JSON.parse(quizJSONConfig);
                                webContents.send(
                                    "receive-json-quiz-file",
                                    quizJSONConfig
                                );
                            }
                        }
                    );
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
