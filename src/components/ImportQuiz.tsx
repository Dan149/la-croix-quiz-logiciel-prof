import { useEffect, useState } from "react";
import BackButton from "./BackButton";

const ImportQuiz = () => {
    const [importedQuizJSONFile, setImportedQuizJSONFile] = useState([])
    const [importQuizFilePath, setImportQuizFilePath] = useState("")

    useEffect(() => {
        window.api.getQuizJSON(async (event: void, JSONFile: string) => {
            await setImportedQuizJSONFile(JSON.parse(JSONFile))
        })
    }, [])
    useEffect(() => {
        window.api.getGlobalQuizFilePath()
        window.api.receiveGlobalQuizFilePath((event: void, ipcGlobalQuizFilePath: string) => {
            setImportQuizFilePath(ipcGlobalQuizFilePath)
        })
    }, [importedQuizJSONFile])
    return (
        <div className="import-quiz-container">
            <BackButton />
            <h2>Veuillez sélectionner un fichier pour continuer.</h2>
            <button onClick={() => {
                window.api.importQuizJSON(async (event: void, JSONFile: string) => {
                    await setImportedQuizJSONFile(JSON.parse(JSONFile))
                })
            }}>Ouvrir un fichier</button>
            {importQuizFilePath === "" ? "" : <button>Utiliser ce fichier</button>}
            <div className="file-selection">
                {importQuizFilePath === "" ? "" : <span>{importQuizFilePath}</span>}
                <div className="questions-container">
                    {importedQuizJSONFile.map((question: any, i) => {
                        return (
                            <div className="question-item" key={i}>
                                <h4>{question.question}</h4>
                                <ol type="A">{
                                    question.possibleAnswers.map((possibleAnswer: string, i: number) => {
                                        return (<li key={i}>{possibleAnswer}</li>)
                                    })
                                }</ol>
                                <span>Réponse: {question.possibleAnswers[parseInt(question.validAnswer)]}</span>
                            </div>)
                    })}
                </div>
            </div>
        </div>
    );
};

export default ImportQuiz;