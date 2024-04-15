import { useRef, useState } from "react";

const UserDataDisplay = () => {
  const [showUserData, setShowUserData] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const useEffectInitialized = useRef(false);
  const fetchUsersDataInterval: any = useRef(null);

  const fetchUsersData = () => {
    window.api.getUsersData((_event: void, APIUsersData: any) => {
      setUsersData(APIUsersData);
    });
  };

  const setFetchingUsersDataInterval = () => {
    fetchUsersDataInterval.current = setInterval(() => fetchUsersData(), 5000);
  };

  return showUserData ? (
    <div className="user-data-display">
      <img
        src="./img/back.svg"
        alt="retour"
        draggable="false"
        className="back-btn"
        onClick={() => {
          setShowUserData(false);
          useEffectInitialized.current = false;
          clearInterval(fetchUsersDataInterval.current);
        }}
      />
      {usersData.length == 0 ? (
        <div className="info">
          Astuce: Les résultats seront automatiquement enregistrés dans vos
          documents à la fermeture de la session.
        </div>
      ) : (
        ""
      )}
      <div className="users-cards-container">
        {usersData.map((user: any, index) => (
          <div className="user-card" key={index}>
            <ul>
              <li>
                <span>Prénom:</span> {user.prenom}
              </li>
              <li>
                <span>Nom:</span> {user.nom}
              </li>
              <li>
                <span>Statut:</span>{" "}
                {user.hasFinished ? "A fini." : "En cours..."}
              </li>
            </ul>
            <div className="quiz-results">
              {user.answersValidity.map(
                (validAnswer: any, answerIndex: number) => {
                  return validAnswer !== undefined ? (
                    <span
                      key={answerIndex}
                      className={
                        validAnswer
                          ? "dot-item right-answer"
                          : "dot-item wrong-answer"
                      }
                    >
                      <i>{answerIndex + 1}</i>
                    </span>
                  ) : (
                    ""
                  );
                }
              )}
            </div>
            <div className="quiz-infos">
              <ul>
                <li>
                  <span>Note:</span>{" "}
                  {`${user.answersValidity.filter((value: boolean) => value)
                    .length
                    }/${user.answersValidity.length}`}
                </li>
                <li>
                  <span>Succès:</span>{" "}
                  {`${Math.floor(
                    (user.answersValidity.filter((value: boolean) => value)
                      .length /
                      user.answersValidity.length) *
                    100
                  )}%`}
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <button
      id="action"
      onClick={() => {
        setShowUserData(true);
        fetchUsersData();
        setFetchingUsersDataInterval();
      }}
    >
      Afficher les données des élèves
    </button>
  );
};

export default UserDataDisplay;
