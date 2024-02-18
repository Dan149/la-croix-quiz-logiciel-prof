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
  //
  receiveGlobalQuizFilePath: async (callback: any) => {
    await ipcRenderer.on("receive-global-quiz-file-path", callback);
  },
});
