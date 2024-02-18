import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("api", {
  getAppVersion: async (callback: any) => {
    await ipcRenderer.send("get-app-version");
    await ipcRenderer.on("receive-app-version", callback);
  },
  //
  setSessionType: async (sessionType: string) => {
    await ipcRenderer.send("set-session-type", sessionType);
  },
  getSessionType: async (callback: any) => {
    await ipcRenderer.send("get-session-type");
    await ipcRenderer.on("receive-session-type", callback);
  },
  //
  exportQuizJSON: async (JSONString: string) => {
    await ipcRenderer.send("export-quiz-JSON", JSONString);
  },
  importQuizJSON: async (callback: any) => {
    await ipcRenderer.send("import-json-quiz-file");
    await ipcRenderer.on("receive-json-quiz-file", callback);
  },
  //
  receiveGlobalQuizFilePath: async (callback: any) => {
    await ipcRenderer.on("receive-global-quiz-file-path", callback);
  },
  getGlobalQuizFilePath: async () => {
    await ipcRenderer.send("get-global-quiz-file-path");
  },
  //
  getQuizJSON: async (callback: any) => {
    ipcRenderer.send("get-json-quiz-file");
    await ipcRenderer.on("receive-json-quiz-file", callback);
  },
});
