import { useEffect, useRef, useState } from "react";
import ToggleSettingBox from "./ToggleSettingBox";

const SettingsManager = () => {
  const [showSettingsManager, setShowSettingsManager] = useState(false)
  const [hasSettingsConfigBeenChanged, setHasSettingsConfigBeenChanged] = useState(false)
  const [settingsList, setSettingsList] = useState<any>({})
  const isUseEffectInitialized = useRef(false)

  const importSettingsList = () => {
    window.api.getSettingsString((event: void, settingsString: string) => {
      setSettingsList(JSON.parse(settingsString))
    })
  }

  const handleSettingsSave = () => {
    window.api.saveNewSettings(JSON.stringify(settingsList))
    setHasSettingsConfigBeenChanged(false)
    isUseEffectInitialized.current = false
  }

  useEffect(() => {
    if (!isUseEffectInitialized.current) {
      isUseEffectInitialized.current = true
      importSettingsList()
    }
  }, [])

  return (
    showSettingsManager ?

      <div className="settings-manager-container">
        <div className="settings-manager">
          <img src="./img/back.svg" alt="retour" draggable="false" className="back-btn" onClick={() =>
            setShowSettingsManager(false)
          } />
          <h2>Paramètres</h2>
          <ul className="settings-list">
            {Object.keys(settingsList).map((key: string) => (
              <li key={key}>{settingsList[key].name} <span onClick={async () => {
                setHasSettingsConfigBeenChanged(true)
                const newSettings = { ...settingsList }
                let newValue: string;
                if (newSettings[key].value == "false") {
                  newValue = "true"
                } else {
                  newValue = "false"
                }
                newSettings[key] = {
                  value: newValue, // issue here
                  name: settingsList[key].name
                }
                setSettingsList(newSettings)
              }}>
                {<ToggleSettingBox value={settingsList[key].value} />}
              </span> </li>
            ))}
          </ul>
        </div>
        {hasSettingsConfigBeenChanged ? <button onClick={() => handleSettingsSave()}>Sauvegarder les nouveaux paramètres</button> : ""}
      </div>

      :

      <button className="show-settings-btn" onClick={() => setShowSettingsManager(true)}>Paramètres</button>
  );
};

export default SettingsManager;