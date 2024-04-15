import { useRef, useState } from "react";

const VoteLikeDisplay = () => {
  const useEffectInitialized = useRef(false);
  const [showUsersData, setShowUsersData] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [questionsData, setQuestionsData]: any = useState([]);
  const [votesData, setVotesData]: any = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(0);
  const [showValidAnswer, setShowValidAnswer] = useState(false);

  const fetchUsersDataInterval: any = useRef(null);

  const fetchUsersData = () => {
    window.api.getUsersData((_event: void, APIUsersData: any) => {
      setUsersData(APIUsersData);
    });
  };

  const fetchQuestionsData = async () => {
    await window.api.getQuizJSON(async (_event: void, JSONFile: string) => {
      await setQuestionsData(JSON.parse(JSONFile));
    });
  };

  const fetchVotesData = () => {
    window.api.getVotesData(async (_event: void, votesAPIData: any) => {
      await setVotesData(votesAPIData);
    });
  };

  const setFetchingUsersDataInterval = () => {
    fetchUsersDataInterval.current = setInterval(() => {
      fetchUsersData();
      fetchVotesData();
    }, 5000);
  };

  return showUsersData ? (
    <div className="vote-like-display">
      <img
        src="./img/back.svg"
        alt="retour"
        draggable="false"
        className="back-btn"
        onClick={() => {
          setShowUsersData(false);
          useEffectInitialized.current = false;
          clearInterval(fetchUsersDataInterval.current);
        }}
      />

      <div className="vote-like-display-container">
        {currentQuestionId >= 1 ? (
          <span
            className="arrow-left"
            onClick={() => {
              setCurrentQuestionId(currentQuestionId - 1);
              setShowValidAnswer(false);
            }}
          ></span>
        ) : (
          ""
        )}
        {currentQuestionId <= questionsData.length - 2 ? (
          <span
            className="arrow-right"
            onClick={() => {
              setCurrentQuestionId(currentQuestionId + 1);
              setShowValidAnswer(false);
            }}
          ></span>
        ) : (
          ""
        )}
        {questionsData.length !== 0 ? (
          <div className="question-votes-view">
            <h3>{questionsData[currentQuestionId].question}</h3>

            <div className="question-votes-container">
              {votesData.length !== 0
                ? votesData[currentQuestionId].map(
                  (votes: number, index: number) =>
                    questionsData[currentQuestionId].possibleAnswers.length >
                      index ? (
                      <div className="votes-card" key={index}>
                        <div className="amount-holder">
                          <div
                            className="amount"
                            id={
                              showValidAnswer
                                ? questionsData[currentQuestionId]
                                  .validAnswer == index
                                  ? "valid"
                                  : "invalid"
                                : ""
                            }
                            style={{
                              height: `${(votes / usersData.length) * 100}%`,
                            }}
                          >
                            {" "}
                            <span className="number">
                              {votes !== 0 ? votes : ""}
                            </span>{" "}
                          </div>
                        </div>
                        <h5 id={showValidAnswer ? "" : `n${index}`}>
                          {
                            questionsData[currentQuestionId].possibleAnswers[
                            index
                            ]
                          }
                        </h5>
                      </div>
                    ) : (
                      ""
                    )
                )
                : "Chargement..."}
            </div>
            <button
              className="btn"
              onClick={() => setShowValidAnswer(!showValidAnswer)}
            >
              {showValidAnswer
                ? "Masquer la bonne réponse"
                : "Afficher la bonne réponse"}
            </button>
          </div>
        ) : (
          "Chargement..."
        )}
      </div>
    </div>
  ) : (
    <button
      id="action"
      onClick={async () => {
        setShowUsersData(true);
        setShowValidAnswer(false);
        fetchUsersData();
        fetchQuestionsData();
        setFetchingUsersDataInterval();
      }}
    >
      Afficher sous forme de votes.
    </button>
  );
};

export default VoteLikeDisplay;
