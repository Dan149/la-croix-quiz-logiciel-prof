import { useEffect, useRef, useState } from "react";
import NotificationPopup from "./NotificationPopup";

const NotificationManager = () => {
  const notificationPool = useRef<any>([])
  const [currentNotification, setCurrentNotification] = useState<any>(null)
  const isListeningToNotifications = useRef(false)
  const isCurrentNotificationEmpty = useRef(true)

  const updateNotifications = () => {
    setTimeout(() => {
      setCurrentNotification(notificationPool.current.shift())
    }, 1000)
    console.log(currentNotification);

    console.log(notificationPool);

  }

  useEffect(() => {
    if (!isListeningToNotifications.current) {
      isListeningToNotifications.current = true

      window.api.listenToNewNotifications(async (event: void, newNotification: any) => {
        if (isCurrentNotificationEmpty.current) {
          isCurrentNotificationEmpty.current = false
          setCurrentNotification(await newNotification)
        } else {
          const notification = await newNotification
          notificationPool.current.push(notification)
        }
        isListeningToNotifications.current = false;
      })
      window.api.listenToCallForCurrentNotificationRemoval(() => {
        setCurrentNotification(null)
        if (notificationPool.current.length >= 1) {
          updateNotifications()
        } else {
          isCurrentNotificationEmpty.current = true
        }
      })
      // window.api.addNewNotificationToPool({ title: "Bienvenue !", message: "Bienvenue sur le logiciel de création de quiz LaCroixQuiz, faites un tour !" })
    }
  }, [isCurrentNotificationEmpty])

  return (
    currentNotification != null ? <NotificationPopup title={currentNotification.title} message={currentNotification.message} time={currentNotification.time} /> : ""
  );
};

export default NotificationManager;