import { useState } from "react";

const UsersRulesCreator = () => { // front page for creating CSV files with user strict names in it.

    type UserRuleType = {
        nom: string;
        prenom: string;
        password?: string;
    }

    const wordList = ["cheval", "taureau", "chien", "chat", "poisson", "lapin", "papillon", "animal", "oiseau", "fourmi", "tapir", "dragon", "abeille", "renard", "loup", "mouton", "bouc", "lama", "alpaga", "serpent", "anaconda", "python", "cobra", "tigre", "lion", "pingouin", "manchot", "panda", "corbeau", "licorne", "caribou", "coyotte", "lutin", "farfadet", "larve", "escargot", "tortue", "jaguar", "requin", "étoile", "kiwi", "crocodile", "aligator", "pangolin", "dromadaire", "bélouga", "orque", "saumon"]
    const adjList = ["féroce", "magnifique", "courageux", "intelligent", "célèbre", "parfait", "sympa", "bon", "beau", "véloce", "furtif", "puissant", "sociable", "travailleur", "robuste", "bavard", "riche", "gentil", "fabuleux", "mystérieux", "énigmatique", "mystique", "marginal", "créateur", "artistique", "rapide", "agile", "artisanal", "ludique", "malicieux", "divertissant", "limpide", "instruit", "ponctuel", "parfumé", "charitable", "amical", "affamé", "patient", "gentilhomme", "galant", "protecteur", "chaleureux", "séduisant", "joli", "esthétique", "intéressant", "optimisé", "enjoué"]

    const [displayComponent, setDisplayComponent] = useState(false);
    const [usePasswords, setUsePasswords] = useState(false);
    const [generatePasswords, setGeneratePasswords] = useState(false);
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

    const generatePasswordString = () => {
        return `${wordList[Math.floor(Math.random() * wordList.length)]}-${adjList[Math.floor(Math.random() * adjList.length)]}-${Math.floor(Math.random() * 100)}`
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
                <label htmlFor="enablePasswords">Configurer des mots de passe</label>
                <input id="enablePasswords" type="checkbox" onChange={(e: any) => setUsePasswords(e.target.checked)} />
                {usePasswords ? <>
                    <label htmlFor="generatePasswords">Générer les mots de passe automatiquement</label>
                    <input id="generatePasswords" type="checkbox" onChange={(e: any) => setGeneratePasswords(e.target.checked)} />
                </> : ""}
            </>
            : ""}
        <div className="rules-editor-container">
            <div className="menu-bar">
                <button onClick={() => setShowNewUserInputField(true)}>Ajouter un utilisateur</button>
                {strictUserNamesArray.length > 0 ? <button onClick={handleCSVFileSave}>Sauvegarder configuration</button> : ""}
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
                                <img src="./img/remove.svg" onClick={() => removeUserRule(index)} draggable="false" />
                            </li>
                        ))
                    }
                </ul>
                {showNewUserInputField ? <form onSubmit={handleNewUserSubmit}>
                    <label htmlFor="nom">Nom:</label>
                    <input type="text" minLength={1} maxLength={20} pattern="^[a-zA-Zéàèç ]+$" placeholder="Entrer un nom." id="nom" required />
                    <label htmlFor="prenom">Prénom:</label>
                    <input type="text" minLength={3} maxLength={20} pattern="^[a-zA-Zéàèç ]+$" placeholder="Entrer un prénom." id="prenom" required />
                    {usePasswords ? <>
                        <label htmlFor="password">Mot de passe:</label>
                        <input type="password" minLength={4} maxLength={20} placeholder="Entrer un mot de passe." id="password" value={generatePasswords ? generatePasswordString() : ""} required />
                    </> : ""}
                    <input type="submit" value="Ajouter" className="btn" />
                </form> : ""}
            </div>
        </div>
    </div> : <button className="btn" onClick={() => setDisplayComponent(true)}>Ouvrir l'éditeur intégré</button>);

}

export default UsersRulesCreator;
