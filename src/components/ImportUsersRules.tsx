import { useState } from "react";

const ImportUsersRules = () => {
    const [showImportUsersRules, setShowImportUsersRules] = useState(false)
    const [usersRules, setUsersRules] = useState<any>([])

    return (showImportUsersRules ?
        <div className="show-import-users-rules">
            <img src="./img/back.svg" alt="retour" draggable="false" className="back-btn" onClick={() => {
                setShowImportUsersRules(false)
            }} />

            <div className="import-users-rules-container">
                <button onClick={() => {
                    window.api.setUsersRules((event: void, serverUsersRules: any) => {
                        setUsersRules(serverUsersRules)
                    })
                }}>Importer un fichier</button>
                <div className="users-rules-display">{usersRules.map((userRule: any) => <div>{userRule}</div>)}</div>
            </div>

        </div> : <button className="btn" onClick={() => setShowImportUsersRules(true)}>Configurer des utilisateurs stricts</button>
    );

}

export default ImportUsersRules;
