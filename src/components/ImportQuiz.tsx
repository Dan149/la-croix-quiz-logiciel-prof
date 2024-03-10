import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import QuizSession from "./QuizSession";

const ImportQuiz = () => {
    const [importedQuizJSONFile, setImportedQuizJSONFile] = useState([])
    const [globalQuizFilePath, setGlobalQuizFilePath] = useState("")
    const [startQuizSession, setStartQuizSession] = useState(false)

    useEffect(() => {
        window.api.getQuizJSON(async (event: void, JSONFile: string) => {
            await setImportedQuizJSONFile(JSON.parse(JSONFile))
        })
    }, [])
    useEffect(() => {
        window.api.getGlobalQuizFilePath()
        window.api.receiveGlobalQuizFilePath((event: void, ipcGlobalQuizFilePath: string) => {
            setGlobalQuizFilePath(ipcGlobalQuizFilePath)
        })
    }, [importedQuizJSONFile])

    const handleFileUse = () => {
        if (globalQuizFilePath !== "") {
            setStartQuizSession(true)
        }
    }

    return (
        <>
            {startQuizSession ? (<QuizSession globalQuizFilePath={globalQuizFilePath} />) : (
                <div className="import-quiz-container">
                    <BackButton />
                    <h2>Veuillez sélectionner un fichier pour continuer.</h2>
                    <button onClick={() => {
                        window.api.importQuizJSON(async (event: void, JSONFile: string) => {
                            await setImportedQuizJSONFile(JSON.parse(JSONFile))
                        })
                    }}>Ouvrir un fichier</button>
                    {globalQuizFilePath === "" ? "" : <button onClick={() => handleFileUse()}>Utiliser ce fichier</button>}
                    <div className="file-selection">
                        {globalQuizFilePath === "" ? "" : <div className="filepath">{globalQuizFilePath}</div>}
                        <div className="questions-container">
                            {importedQuizJSONFile.map((question: any, i) => {
                                return (
                                    <div className="question-item" key={i}>
                                        <div className="amount">
                                            {i + 1}/{importedQuizJSONFile.length}
                                        </div>
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
            )}
        </>
    );
};

export default ImportQuiz;