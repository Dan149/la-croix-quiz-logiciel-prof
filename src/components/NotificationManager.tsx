import { useEffect, useRef, useState } from "react";

const NotificationManager = () => {
  type LocalNotification = { title: string, message: string, time: string };

  const [notificationPoolArray, setNotificationPoolArray] = useState<any[]>([]);
  const [showNotificationManager, setShowNotificationManager] = useState(false);
  const isListeningToNotifications = useRef(false)

  const removeNotification = (index: any) => {
    setNotificationPoolArray(notificationPoolArray.filter((_el: any, id: number) => index != id));
  }

  useEffect(() => {
    if (!isListeningToNotifications.current) {
      isListeningToNotifications.current = true

      window.api.listenToNewNotifications((_event: void, newNotification: LocalNotification) => {
        let push = true;
        if (push) {
          setNotificationPoolArray((notificationPoolArray) => [...notificationPoolArray, newNotification]);
          push = false;
        }
        isListeningToNotifications.current = false;
        // window.api.addNewNotificationToPool({ title: "Bienvenue !", message: "Bienvenue sur le logiciel de création de quiz LaCroixQuiz, faites un tour !" })
      });
    }
  }, [])


  return <>
    <div className="notification-manager-sidebar" style={showNotificationManager ? { right: "0px" } : { right: "-550px" }}>

      <img
        src="./img/close.png"
        alt="retour"
        draggable="false"
        className="back-btn"
        onClick={() => setShowNotificationManager(false)}
      />
      <ul className="notification-pool">
        {notificationPoolArray.map((notification: LocalNotification, index: number) =>
          <li key={index}>
            <img src="./img/close.png" onClick={() => removeNotification(index)} className="notif-remove-btn" draggable="false" />
            <h4>
              {notification.title}
            </h4>
            <p>{notification.message}</p>
            <span>{notification.time}</span>
          </li>
        )} {notificationPoolArray.length == 0 ? <h3 className="no-notif">Aucune notification.</h3> : ""}
      </ul>
    </div>
    <img src={notificationPoolArray.length == 0 ? "./img/notif.svg" : "./img/notif-unread.svg"} title="Afficher les notifications." onClick={() => setShowNotificationManager(true)} className="display-notifs-btn" style={showNotificationManager ? { right: "-50px" } : { right: "0px" }} draggable="false" />

  </>
};

export default NotificationManager;
