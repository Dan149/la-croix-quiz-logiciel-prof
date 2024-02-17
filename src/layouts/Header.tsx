import { useEffect, useState } from "react";

const Header = () => {
  const [appVersion, setAppVersion] = useState("")
  useEffect(() => {
    window.api.getAppVersion((event: void, version: any) => {
      setAppVersion(version)
    })
  }, [])
  return (
    <header>
      <div className="header-title">
        <h2>Saint Jean et La Croix</h2>
        -
        <h3>Logiciel de création de quiz scolaire.</h3>
        <span className="app-version">v {appVersion}</span>
      </div>
      <img src="./img/st-jean-logo.png" alt="st-jean logo" draggable="false" />
    </header>
  );
};

export default Header;