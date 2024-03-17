import { useRef, useState } from "react";

const VoteLikeDisplay = () => {
  const useEffectInitialized = useRef(false)
  const [showUsersData, setShowUsersData] = useState(false)
  const [usersData, setUsersData] = useState([])
  const [questionsData, setQuestionsData]: any = useState([])
  const [votesData, setVotesData]: any = useState([])
  const [currentQuestionId, setCurrentQuestionId] = useState(0)

  const fetchUsersDataInterval: any = useRef(null)

  const fetchUsersData = () => {
    window.api.getUsersData(async (event: void, APIUsersData: any) => {
      await setUsersData(APIUsersData);
    })
  }

  const fetchQuestionsData = async () => {
    await window.api.getQuizJSON(async (event: void, JSONFile: string) => {
      await setQuestionsData(JSON.parse(JSONFile))
    })
  }

  const fetchVotesData = () => {
    window.api.getVotesData(async (event: void, votesAPIData: any) => {
      await setVotesData(votesAPIData)
    })
  }

  const setFetchingUsersDataInterval = () => {
    fetchUsersDataInterval.current = setInterval(() => {
      fetchUsersData()
      fetchVotesData()
    }, 5000)
  }



  return (
    showUsersData ? (
      <div className="vote-like-display">
        <img src="./img/back.svg" alt="retour" draggable="false" className="back-btn" onClick={() => {
          setShowUsersData(false)
          useEffectInitialized.current = false
          clearInterval(fetchUsersDataInterval.current)
        }} />

        <div className="vote-like-display-container">
          {currentQuestionId >= 1 ? <span className="arrow-left" onClick={() => setCurrentQuestionId(currentQuestionId - 1)}></span> : ""}
          {currentQuestionId <= questionsData.length - 2 ? <span className="arrow-right" onClick={() => setCurrentQuestionId(currentQuestionId + 1)}></span> : ""}
          {questionsData.length !== 0 ? <div className="question-votes-view">
            <h3>{questionsData[currentQuestionId].question}</h3>

            <div className="question-votes-container">
              {votesData.length !== 0 ? votesData[currentQuestionId].map((votes: number, index: number) => (
                questionsData[currentQuestionId].possibleAnswers.length > index ? <div className="votes-card" key={index}>
                  <div className="amount-holder">
                    <div className="amount" style={questionsData[currentQuestionId].validAnswer == index ? { background: "#31c464", boxShadow: "inset 5px 5px 8px #25934b, inset -5px -5px 8px #3df57d", height: `${(votes / usersData.length) * 100}%` } : { height: `${(votes / usersData.length) * 100}%` }}> <span className="number">{votes !== 0 ? votes : ""}</span> </div>
                  </div>
                  <h5>{questionsData[currentQuestionId].possibleAnswers[index]}</h5>
                </div> : ""
              )) : "Chargement..."}
            </div>
          </div> : "Chargement..."}
        </div>
      </div>
    ) : (
      <button className="vote-like-display-btn btn" onClick={async () => {
        setShowUsersData(true)
        await fetchUsersData()
        fetchQuestionsData()
        setFetchingUsersDataInterval()
      }
      }>Afficher sous forme de votes.</button>
    )
  );
}

export default VoteLikeDisplay;