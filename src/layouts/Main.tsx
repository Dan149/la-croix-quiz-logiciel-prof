import { useEffect, useState } from "react";
import SessionPopups from "../components/SessionPopups";

const Main = () => {
  const [sessionType, setSessionType] = useState("")
  useEffect(() => {
    window.api.getSessionType((event: void, type: string) => {
      setSessionType(type)
    })
  }, [])
  return (
    <main>
      {sessionType === "" ? <SessionPopups /> : <h1>{sessionType}</h1>}
    </main>
  );
};

export default Main;