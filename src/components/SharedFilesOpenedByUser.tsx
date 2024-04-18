import { useState } from "react";

const SharedFilesOpenedByUser = (props: any) => {
    const [showFiles, setShowFiles] = useState(false);
    return (<div className="shared-files-opened-by-user-container">
        {showFiles ? <ul className="file-list">
            {props.filesArray.map((file: string) =>
                <li key={file}>{file}</li>
            )}
        </ul> : ""}<a onClick={() => setShowFiles(!showFiles)}>{showFiles ? "Masquer les fichiers ressources ouverts" : "Afficher les fichiers ressources ouverts"}</a>
    </div>);
}

export default SharedFilesOpenedByUser;
