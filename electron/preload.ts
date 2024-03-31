import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("api", {
  getAppVersion: async (callback: any) => {
    ipcRenderer.send("get-app-version");
    await ipcRenderer.on("receive-app-version", callback);
  },
  //
  setSessionType: (sessionType: string) => {
    ipcRenderer.send("set-session-type", sessionType);
  },
  getSessionType: async (callback: any) => {
    ipcRenderer.send("get-session-type");
    await ipcRenderer.on("receive-session-type", callback);
  },
  //
  exportQuizJSON: (JSONString: string) => {
    ipcRenderer.send("export-quiz-JSON", JSONString);
  },
  importQuizJSON: async (callback: any) => {
    ipcRenderer.send("import-json-quiz-file");
    await ipcRenderer.on("receive-json-quiz-file", callback);
  },
  //
  getGlobalQuizFilePath: (callback: any) => {
    ipcRenderer.send("get-global-quiz-file-path");
    ipcRenderer.on("receive-global-quiz-file-path", callback);
  },
  //
  getQuizJSON: async (callback: any) => {
    ipcRenderer.send("get-json-quiz-file");
    await ipcRenderer.on("receive-json-quiz-file", callback);
  },
  // QuizAPIServer => express.js
  startQuizAPIServer: () => {
    ipcRenderer.send("start-quiz-API-server");
  },
  stopQuizAPIServer: () => {
    ipcRenderer.send("stop-quiz-API-server");
  },
  getQuizAPIServerStatus: (callback: any) => {
    ipcRenderer.on("get-quiz-API-server-status", callback);
  },
  allowQuizStart: () => {
    ipcRenderer.send("allow-quiz-start");
  },
  getUsersData: (callback: any) => {
    ipcRenderer.send("get-users-data");
    ipcRenderer.on("receive-users-data", callback);
  },
  resetUsersData: () => {
    ipcRenderer.send("reset-users-data");
  },
  getVotesData: (callback: any) => {
    ipcRenderer.send("get-votes-data");
    ipcRenderer.on("receive-votes-data", callback);
  },
  // Notifications:
  addNewNotificationToPool: (notificationParams: any) => {
    ipcRenderer.send("add-new-notification-to-pool", notificationParams);
  },
  listenToNewNotifications: (callback: any) => {
    ipcRenderer.on("receive-notification", callback);
  },
  callForCurrentNotificationRemoval: () => {
    ipcRenderer.send("call-current-notification-removal");
  },
  listenToCallForCurrentNotificationRemoval: (callback: any) => {
    ipcRenderer.on("remove-current-notification", callback);
  },
  // Settings:
  getSettingsString: (callback: any) => {
    ipcRenderer.send("get-settings-string");
    ipcRenderer.on("receive-settings-string", callback);
  },
  saveNewSettings: (newSettings: string) => {
    ipcRenderer.send("rewrite-settings", newSettings);
  },
});
