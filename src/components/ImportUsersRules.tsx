import { useState } from "react";
import UsersRulesCreator from "./UsersRulesCreator";

const ImportUsersRules = () => {
  const [showImportUsersRules, setShowImportUsersRules] = useState(false);
  const [usersRules, setUsersRules] = useState<any>(undefined);

  return showImportUsersRules ? (
    <div className="show-import-users-rules">
      <img
        src="./img/back.svg"
        alt="retour"
        draggable="false"
        className="back-btn"
        onClick={() => {
          setShowImportUsersRules(false);
        }}
      />

      <div className="import-users-rules-container">
        <p className="infos">
          Vous pouvez importer une liste de noms et prénoms au format CSV qui
          obligera les élèves à choisir leurs noms dans la liste.
        </p>

        <ul>
          <li>
            Le fichier CSV doit contenir une colonne "nom" et une autre
            "prenom". Il peut contenir une colonne "password" optionnelle, pour assigner un mot de passe à chaque élève.
          </li>
          <li>Le séparateur doit être une virgule: ",".</li>
        </ul>
        {usersRules == undefined ? (
          <div className="actions">
            <UsersRulesCreator />
            <button
              className="btn"
              onClick={() => {
                window.api.setUsersRules((_event: void, serverUsersRules: any) => {
                  setUsersRules(serverUsersRules);
                  // console.log(serverUsersRules)
                });
              }}
            >
              Importer un fichier
            </button>
          </div>
        ) : (
          ""
        )}
        <div className="users-rules-display">
          <ul>
            <li>Nom</li> <li>Prénom</li>
            {usersRules !== undefined
              ? usersRules.map((userRule: any, index: number) => (
                <>
                  <li key={index}>{userRule["nom"]}</li>
                  <li key={index + 1}>{userRule["prenom"]}</li>
                </>
              ))
              : ""}
          </ul>
        </div>
      </div>
    </div>
  ) : (
    <button className="btn" onClick={() => setShowImportUsersRules(true)}>
      Configurer des utilisateurs stricts
    </button>
  );
};

export default ImportUsersRules;
