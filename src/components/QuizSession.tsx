import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import UserDataDisplay from "./UserDataDisplay";
import VoteLikeDisplay from "./VoteLikeDisplay";

const QuizSession = (props: any) => { // filepath
  const [quizAPIServerEvents, setQuizAPIServerEvents] = useState<any[]>([])
  const [isAPIServerOn, setIsAPIServerOn] = useState(false)
  const [isQuizStartAllowed, setIsQuizStartAllowed] = useState(false)
  const useEffectInitialized = useRef(false)

  const handleQuizAPIServerStart = async () => {
    await setQuizAPIServerEvents([])
    window.api.startQuizAPIServer();
    setIsAPIServerOn(true);
  }
  const handleQuizAPIServerStop = () => {
    window.api.stopQuizAPIServer();
    setIsAPIServerOn(false);
    setIsQuizStartAllowed(false);
  }

  const handleQuizAPIServerLogs = () => {
    window.api.getQuizAPIServerStatus((event: void, realEvent: any) => {
      setQuizAPIServerEvents((quizAPIServerEvents) => [...quizAPIServerEvents, realEvent])
    });
  }

  const allowQuizStart = () => {
    window.api.allowQuizStart();
    setIsQuizStartAllowed(true)
  }

  useEffect(() => {
    if (!useEffectInitialized.current) {
      useEffectInitialized.current = true // avoiding double execution
      handleQuizAPIServerLogs();
    }
  }, [])

  return (
    <div className="quiz-session-container">
      {isAPIServerOn ? "" : <BackButton />}
      {isAPIServerOn ? <h2>Session en cours...</h2> : <h2>Démarrer la session ?</h2>}
      <h5 className="filepath">Chemin d'accès du fichier de configuration du quiz: {props.globalQuizFilePath}</h5>
      {quizAPIServerEvents.length > 0 ? <div className="quiz-api-server-logs">
        {quizAPIServerEvents.map((event, index) => {
          return <div className={`event-type-${event["type"]} event`} key={index}>
            <h5>{event.type}:</h5>
            <span className="event-message">
              {event["message"]}
            </span>
          </div>;
        })}
      </div> : <div className="empty-space"></div>}
      {isQuizStartAllowed ? <>
        <UserDataDisplay />
        <VoteLikeDisplay />
      </> : ""}
      {isAPIServerOn && !isQuizStartAllowed ? <button onClick={() => allowQuizStart()} className="allow-start-btn btn">Autoriser le début du quiz</button> : ""}
      {isAPIServerOn ? <button className="stop-quiz-btn btn" onClick={() => handleQuizAPIServerStop()}>Fermer la session</button> : <button className="start-quiz-btn btn" onClick={() => handleQuizAPIServerStart()}>C'est parti !</button>}
    </div>
  );
};

export default QuizSession;