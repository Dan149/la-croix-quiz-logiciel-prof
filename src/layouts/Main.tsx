import { useEffect, useState } from "react";
import SessionPopups from "../components/SessionPopups";
import CreateNewQuiz from "../components/CreateNewQuiz";
import ImportQuiz from "../components/ImportQuiz";
import NotificationManager from "../components/NotificationManager";

const Main = () => {
  const [sessionType, setSessionType] = useState("")
  useEffect(() => {
    window.api.getSessionType((event: void, type: string) => {
      setSessionType(type)
    })
    window.api.getSettingsString((event: any, settingsString: string) => {
      const settings: any = JSON.parse(settingsString)
      const body: any = document.getElementById("body")
      if (settings.darkMode.value == "true") {
        body.classList.add("dark")
      } else {
        body.classList.remove("dark")
      }
    })
  }, [])
  return (
    <main>
      <NotificationManager />
      {sessionType === "" ? <SessionPopups /> : (sessionType === "create" ? <CreateNewQuiz /> : <ImportQuiz />)}
    </main>
  );
};

export default Main;