import { useState } from "react";

const UsersRulesCreator = () => { // front page for creating CSV files with user strict names in it.

    type UserRuleType = {
        nom: string;
        prenom: string;
        password?: string;
    }

    const [displayComponent, setDisplayComponent] = useState(false);
    const [usePasswords, setUsePasswords] = useState(false);
    const [strictUserNamesArray, setStrictUserNamesArray] = useState<UserRuleType[]>([]);
    const [showNewUserInputField, setShowNewUserInputField] = useState(false)

    const handleNewUserSubmit = (e: any) => {
        e.preventDefault();
        if (usePasswords) {
            setStrictUserNamesArray((strictUserNamesArray) => [...strictUserNamesArray, { nom: e.target[0].value, prenom: e.target[1].value, password: e.target[2].value }]);
        } else {
            setStrictUserNamesArray((strictUserNamesArray) => [...strictUserNamesArray, { nom: e.target[0].value, prenom: e.target[1].value }]);
        }
        setShowNewUserInputField(false);
    }

    const removeUserRule = (index: number) => {
        setStrictUserNamesArray(strictUserNamesArray.filter((_rule, i: number) => i != index));
    }

    const handleCSVFileSave = () => {
        window.api.exportUsersNamesRulesToCSV(strictUserNamesArray);
    }

    return (displayComponent ? <div className="users-rules-creator-container">
        <img
            src="./img/back.svg"
            alt="retour"
            draggable="false"
            className="back-btn"
            onClick={() => {
                setDisplayComponent(false);
                setStrictUserNamesArray([]);
            }}
        />
        {strictUserNamesArray.length == 0 ?
            <>
                <label htmlFor="enablePasswords">Configurer des mots de passes</label>
                <input id="enablePasswords" type="checkbox" onChange={(e: any) => setUsePasswords(e.target.checked)} />
            </>
            : ""}
        <div className="rules-editor-container">
            <div className="menu-bar">
                <button onClick={() => setShowNewUserInputField(true)}>Ajouter un utilisateur</button>
                <button onClick={handleCSVFileSave}>Sauvegarder configuration</button>
            </div>
            <div className="editor">
                <ul className="users-rules-list">
                    {
                        strictUserNamesArray.map((userRule: UserRuleType, index: number) => (
                            <li key={index} style={usePasswords ? { gridTemplateColumns: "1fr 1fr" } : {}}>
                                {userRule.nom} - {userRule.prenom}
                                {usePasswords ?
                                    <span className="password hidden" title="Afficher le mot de passe" onClick={(e: any) => e.target.classList.toggle("hidden")}>{userRule.password}</span> : ""
                                }
                                <img src="./img/remove.svg" onClick={() => removeUserRule(index)} />
                            </li>
                        ))
                    }
                </ul>
                {showNewUserInputField ? <form onSubmit={handleNewUserSubmit}>
                    <label htmlFor="nom">Nom:</label>
                    <input type="text" minLength={1} maxLength={20} pattern="^[a-zA-Zéàèç]+$" placeholder="Entrer un nom." id="nom" required />
                    <label htmlFor="prenom">Prénom:</label>
                    <input type="text" minLength={3} maxLength={20} pattern="^[a-zA-Zéàèç]+$" placeholder="Entrer un prénom." id="prenom" required />
                    {usePasswords ? <>
                        <label htmlFor="password">Mot de passe:</label>
                        <input type="password" minLength={4} maxLength={20} placeholder="Entrer un mot de passe." id="password" required />
                    </> : ""}
                    <input type="submit" value="Ajouter" className="btn" />
                </form> : ""}
            </div>
        </div>
    </div> : <button className="btn" onClick={() => setDisplayComponent(true)}>Ouvrir l'éditeur intégré</button>);

}

export default UsersRulesCreator;
