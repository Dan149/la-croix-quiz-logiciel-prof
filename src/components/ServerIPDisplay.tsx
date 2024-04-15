import { useEffect, useState } from "react";

const ServerIPDisplay = () => {
  const [showServerIPDisplay, setShowServerIPDisplay] = useState(false)
  const [avalaibleIPaddresses, setAvalaibleIPaddresses] = useState<any>({})
  const [selectedInterface, setSelectedInterface] = useState("")

  useEffect(() => {
    window.api.getAvailableIPs((_event: void, availableIPs: any) => {
      setAvalaibleIPaddresses(availableIPs)
    })
  }, [])

  return (
    showServerIPDisplay ?
      <div className="server-ip-display">
        <img src="./img/back.svg" alt="retour" draggable="false" className="back-btn" onClick={() => {
          setShowServerIPDisplay(false)
        }} />
        <div className="infos">
          <h4>Définissez l'interface réseau pour afficher le lien de connexion correspondant.</h4>
          <br />
          <p>Vérifiez vos paramètres de pare-feu et assurez vous que le port 3333 est ouvert au public.
            <hr />
            Astuce: les interfaces sans fil se nomment souvent <strong>wlan</strong>.
          </p>
        </div>

        <div className="ip-addr-container">
          <div className="interface-and-ip">
            <select className="interface-select" onChange={(e: any) => setSelectedInterface(e.target.value)
            }>
              <option value="">Choisissez une interface.</option>
              {Object.keys(avalaibleIPaddresses).map((key: string) => (
                <option value={key} key={key}>{key}</option>
              ))
              }</select>
            {selectedInterface == "" ? "" :
              <div className="ip-addr">http://{avalaibleIPaddresses[selectedInterface][0]}:3333</div>
            }
          </div>
        </div>

      </div> : <button id="action" onClick={() => setShowServerIPDisplay(true)}>Afficher le lien du quiz</button>
  );
};

export default ServerIPDisplay;
