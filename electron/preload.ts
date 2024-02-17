import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("api", {
  getAppVersion: async (callback: any) => {
    await ipcRenderer.send("get-app-version");
    await ipcRenderer.on("receive-app-version", callback);
  },
  //
  setSessionType: async (args: object) => {
    await ipcRenderer.send("set-session-type", args);
  },
  getSessionType: async (callback: any) => {
    await ipcRenderer.send("get-session-type");
    await ipcRenderer.on("receive-session-type", callback);
  },
});
