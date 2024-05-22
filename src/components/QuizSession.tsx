import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import UserDataDisplay from "./UserDataDisplay";
import VoteLikeDisplay from "./VoteLikeDisplay";
import ServerIPDisplay from "./ServerIPDisplay";

const QuizSession = (props: any) => { // filepath
  const [quizAPIServerEvents, setQuizAPIServerEvents] = useState<any[]>([])
  const [isAPIServerOn, setIsAPIServerOn] = useState(false)
  const [isQuizStartAllowed, setIsQuizStartAllowed] = useState(false)
  const useEffectInitialized = useRef(false)

  const handleQuizAPIServerStart = () => {
    setQuizAPIServerEvents([])
    setIsAPIServerOn(true);
    window.api.startQuizAPIServer();
  }
  const handleQuizAPIServerStop = async () => {
    await window.api.pleaseDanielExportUsersDataToCSV();
    window.api.stopQuizAPIServer();
    setIsAPIServerOn(false);
    setIsQuizStartAllowed(false);
  }

  const handleQuizAPIServerLogs = () => {
    window.api.getQuizAPIServerStatus((_event: void, realEvent: any) => {
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
      {props.isPlainVoteQuiz ?
        <h5 className="filepath">Quiz à votes numérotés.</h5>
        :
        <h5 className="filepath">Chemin d'accès du fichier de configuration du quiz: {props.globalQuizFilePath}</h5>}
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

      <div className="quiz-actions-container">
        <div className="quiz-actions-flex">
          {isQuizStartAllowed ? <>
            <UserDataDisplay />
            <VoteLikeDisplay isPlainVoteQuiz={props.isPlainVoteQuiz} />
          </> : ""}
          {isAPIServerOn ? <>
            <ServerIPDisplay />
            {!isQuizStartAllowed ? <button onClick={() => allowQuizStart()} id="action">Autoriser le début du quiz</button> : ""}</> : ""}
          {isAPIServerOn ? <button onClick={() => handleQuizAPIServerStop()} id="action" className="close-btn">Fermer la session</button> : <button onClick={() => handleQuizAPIServerStart()} id="action">C'est parti !</button>}
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
