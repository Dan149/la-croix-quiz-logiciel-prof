import { useEffect, useState } from "react"

const NotificationPopup = (props: any) => {
  const [isPopupShown, setIsPopupShown] = useState(true)

  const handlePopupExit = () => {
    window.api.callForCurrentNotificationRemoval()
    setIsPopupShown(false)
  }

  return (
    isPopupShown ? (<div className="notification-popup">
      <div className="content">
        <img src="./img/close.png" alt="fermer" onClick={() => handlePopupExit()} />
        <h2>{props.title}</h2>
        <p>{props.message}</p>
        <span>{props.time}</span>
      </div>
    </div>) : ""
  );
}

export default NotificationPopup;