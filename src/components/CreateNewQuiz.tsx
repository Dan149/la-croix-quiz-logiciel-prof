import { useEffect, useState } from "react";
import BackButton from "./BackButton";
import QuizSession from "./QuizSession";

const CreateNewQuiz = () => {
    const [createNewQuestion, setCreateNewQuestion] = useState(false);
    const [questionArray, setQuestionArray] = useState<object[]>([]);
    const [globalQuizFilePath, setGlobalQuizFilePath] = useState("")

    const handleNewQuestionSubmit = (e: any) => {
        e.preventDefault()
        const newQuestion = {
            question: e.target[0].value,
            possibleAnswers: [e.target[1].elements[0].value, e.target[1].elements[1].value, e.target[1].elements[2].value, e.target[1].elements[3].value].filter((element: any) => element !== ''),
            validAnswer: e.target[6].value,
        }
        if (newQuestion.possibleAnswers[parseInt(newQuestion.validAnswer)]) {
            setQuestionArray((questionArray) => [...questionArray, newQuestion])
        }
        setCreateNewQuestion(false)
    }

    const handleQuizExport = () => {
        if (questionArray.length > 0) {
            window.api.exportQuizJSON(JSON.stringify(questionArray))
        }
    }

    const handleQuestionRemove = (e: any, key: number) => {
        const newQuestionArray = questionArray.filter((question: any, index) => index !== key)
        setQuestionArray(newQuestionArray)
    }

    useEffect(() => {
        window.api.getGlobalQuizFilePath((event: void, ipcGlobalQuizFilePath: string) => {
            setGlobalQuizFilePath(ipcGlobalQuizFilePath)
        })
    }, [])

    return (
        <div className="create-quiz-container">
            {globalQuizFilePath !== "" ? <QuizSession globalQuizFilePath={globalQuizFilePath} /> : (
                <>
                    <BackButton />
                    <h2>
                        Création du quiz:
                    </h2>
                    <div id="quiz-creator">
                        <div className="menu-bar">

                            <button onClick={() => setCreateNewQuestion(true)}>Nouvelle Question</button>
                            <button onClick={() => handleQuizExport()}>Sauvegarder Quiz</button>
                        </div>
                        <div className="questions-container">
                            {questionArray.map((question: any, i) => {
                                return (
                                    <div className="question-item" key={i}>
                                        <div className="amount">
                                            {i + 1}/{questionArray.length}
                                        </div>
                                        <img className="remove-btn" src="./img/remove.svg" alt="supprimer la question" onClick={(e: any, key: number = i) => handleQuestionRemove(e, key)} />
                                        <h4>{question.question}</h4>
                                        <ol type="A">{
                                            question.possibleAnswers.map((possibleAnswer: string, i: number) => {
                                                return (<li key={i}>{possibleAnswer}</li>)
                                            })
                                        }</ol>
                                        <span>Réponse: {question.possibleAnswers[parseInt(question.validAnswer)]}</span>
                                    </div>)
                            })}
                            {createNewQuestion ? (
                                <form className="new-question" onSubmit={(e) => handleNewQuestionSubmit(e)}>
                                    <label htmlFor="question">Question:</label>
                                    <input type="text" name="question" placeholder="Ecrire une question..." maxLength={100} required />
                                    <fieldset>
                                        <legend>Réponses possibles (2 minimum):</legend>
                                        <input type="text" name="answer-a" placeholder="Réponse A" maxLength={80} required />
                                        <input type="text" name="answer-b" placeholder="Réponse B" maxLength={80} required />
                                        <input type="text" name="answer-c" placeholder="Réponse C" maxLength={80} />
                                        <input type="text" name="answer-d" placeholder="Réponse D" maxLength={80} />
                                    </fieldset>
                                    <label htmlFor="valid-answer">Bonne réponse:</label>
                                    <select name="valid-answer" id="valid-answer" required>
                                        <option value="0">Réponse A</option>
                                        <option value="1">Réponse B</option>
                                        <option value="2">Réponse C</option>
                                        <option value="3">Réponse D</option>
                                    </select>
                                    <input type="submit" value="Valider" />
                                </form>
                            ) : ""}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateNewQuiz;