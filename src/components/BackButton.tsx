const BackButton = () => {
    return (
        <img src="./img/back.svg" alt="retour" draggable="false" className="back-btn" onClick={() => window.api.setSessionType("")} />
    );
};

export default BackButton;