import { useState } from "react";

const SessionPopups = () => {
  return (
    <div className="session-popups">
      <h2>Choisissez la méthode de création du quiz:</h2>
      <div className="session-popups-container">
        <div className="popup" onClick={() => {
          window.api.setSessionType("create")
        }}>
          <img src="./img/new-session.svg" alt="créer une session" draggable="false" />
          <h3>Nouvelle session</h3>
        </div>
        <div className="popup" onClick={() => {
          window.api.setSessionType("import")
        }}>
          <img src="./img/upload.svg" alt="importer une session" draggable="false" />
          <h3>Importer une session</h3>
        </div>
      </div>
    </div>
  );
};

export default SessionPopups;