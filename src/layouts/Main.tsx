import { useEffect, useState } from "react";
import SessionPopups from "../components/SessionPopups";
import CreateNewQuiz from "../components/CreateNewQuiz";
import ImportQuiz from "../components/ImportQuiz";

const Main = () => {
  const [sessionType, setSessionType] = useState("")
  useEffect(() => {
    window.api.getSessionType((event: void, type: string) => {
      setSessionType(type)
    })
  }, [])
  return (
    <main>
      {sessionType === "" ? <SessionPopups /> : (sessionType === "create" ? <CreateNewQuiz /> : <ImportQuiz />)}
    </main>
  );
};

export default Main;