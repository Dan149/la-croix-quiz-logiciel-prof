import { useState } from "react";
import BackButton from "./BackButton";

const CreateNewQuiz = () => {
    const [createNewQuestion, setCreateNewQuestion] = useState(false);
    const [questionArray, setQuestionArray] = useState<object[]>([]);

    const handleNewQuestionSubmit = (e: any) => {
        e.preventDefault()
        const newQuestion = {
            question: e.target[0].value,
            possibleAnswers: [e.target[1].elements[0].value, e.target[1].elements[1].value, e.target[1].elements[2].value, e.target[1].elements[3].value].filter((element: any) => element !== ''),
            validAnswer: e.target[6].value
        }
        setQuestionArray((questionArray) => [...questionArray, newQuestion])
        setCreateNewQuestion(false)
    }

    return (
        <div className="create-quiz-container">
            <BackButton />
            <h2>
                Création du quiz:
            </h2>
            <div id="quiz-creator">

                <div className="questions-container">
                    {questionArray.map((question: any, i) => {
                        return (
                            <div className="question-item" key={i}>
                                <span>{question.question}</span>
                                <ol>{question.possibleAnswers.map((possibleAnswer: string, i: number) => {
                                    <li key={i}>{possibleAnswer}</li>
                                })}</ol>
                                <span>Réponse: {question.possibleAnswers[parseInt(question.validAnswer)]}</span>
                            </div>)
                    })}
                    {createNewQuestion ? (
                        <form className="new-question" onSubmit={(e) => handleNewQuestionSubmit(e)}>
                            <label htmlFor="question">Question:</label>
                            <input type="text" name="question" required />
                            <fieldset>
                                <legend>Réponses possibles (2 minimum):</legend>
                                <input type="text" name="answer-a" placeholder="Réponse A" required />
                                <input type="text" name="answer-b" placeholder="Réponse B" required />
                                <input type="text" name="answer-c" placeholder="Réponse C" />
                                <input type="text" name="answer-d" placeholder="Réponse D" />
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

                <div className="creator-menu-bar">
                    <ul>
                        <li onClick={() => setCreateNewQuestion(true)}>Nouvelle Question</li>
                        <li>Sauvegarder Quiz</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateNewQuiz;