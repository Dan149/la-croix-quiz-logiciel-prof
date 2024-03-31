import { useEffect, useRef, useState } from "react";
import ToggleSettingBox from "./ToggleSettingBox";

const SettingsManager = () => {
  const [showSettingsManager, setShowSettingsManager] = useState(false)
  const [settingsList, setSettingsList] = useState<any>({})
  const isUseEffectInitialized = useRef(false)

  const importSettingsList = () => {
    window.api.getSettingsString((event: void, settingsString: string) => {
      setSettingsList(JSON.parse(settingsString))
    })
  }



  useEffect(() => {
    if (!isUseEffectInitialized.current) {
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
                const newSettings = { ...settingsList }
                newSettings[key] = {
                  value: `${!newSettings[key].value}`, // issue here
                  name: settingsList[key].name
                }
                setSettingsList(newSettings)
              }}>
                {<ToggleSettingBox value={settingsList[key].value} />}
              </span> </li>
            ))}
          </ul>
        </div>
      </div>

      :

      <button className="show-settings-btn" onClick={() => setShowSettingsManager(true)}>Paramètres</button>
  );
};

export default SettingsManager;