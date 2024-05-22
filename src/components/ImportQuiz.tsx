import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import QuizSession from "./QuizSession";

const ImportQuiz = () => {
    const [importedQuizJSONFile, setImportedQuizJSONFile] = useState([])
    const [globalQuizFilePath, setGlobalQuizFilePath] = useState("")
    const [startPlainVoteQuiz, setStartPlainVoteQuiz] = useState(false)
    const [startQuizSession, setStartQuizSession] = useState(false)
    const isUseEffectInitialized = useRef(false)

    useEffect(() => {
        if (!isUseEffectInitialized.current) {
            isUseEffectInitialized.current = true
            window.api.getQuizJSON((_event: void, JSONFile: string) => {
                setImportedQuizJSONFile(JSON.parse(JSONFile))
                window.api.getGlobalQuizFilePath((_event: void, ipcGlobalQuizFilePath: string) => {
                    setGlobalQuizFilePath(ipcGlobalQuizFilePath)
                })
            })
        }
    }, [])

    const handleFileUse = () => {
        if (globalQuizFilePath !== "" || startPlainVoteQuiz) {
            setStartQuizSession(true)
        }
    }

    return (
        <>
            {startQuizSession ? (<QuizSession globalQuizFilePath={globalQuizFilePath} isPlainVoteQuiz={startPlainVoteQuiz} />) : (
                <div className="import-quiz-container">
                    <BackButton />
                    <h2>Veuillez sélectionner un fichier pour continuer.</h2>
                    <button onClick={() => {
                        window.api.importQuizJSON((_event: void, JSONFile: string) => {
                            setImportedQuizJSONFile(JSON.parse(JSONFile))
                        })
                    }}>Ouvrir un fichier</button>
                    <button onClick={() => {
                        window.api.startPlainVoteQuiz()
                        setStartPlainVoteQuiz(true)
                    }
                    }>Démarrer des votes numérotées</button>
                    {globalQuizFilePath == "" ? "" : <button onClick={() => handleFileUse()}>Utiliser ce fichier</button>}
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
                </div >
            )}
        </>
    );
};

export default ImportQuiz;
