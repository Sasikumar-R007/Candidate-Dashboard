/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVNkVs0NaJyBYiPSK32pgljzGlASzzqFU",
  authDomain: "staffos-ntf.firebaseapp.com",
  projectId: "staffos-ntf",
  storageBucket: "staffos-ntf.firebasestorage.app",
  messagingSenderId: "107694181935",
  appId: "1:107694181935:web:4c2243310fd30ecf03c0da",
});

const messaging = firebase.messaging();

function notificationDataFromPayload(payload) {
  const data = { ...(payload.data || {}) };
  if (payload.data?.applicationId) {
    data.applicationId = String(payload.data.applicationId);
  }
  if (payload.data?.type) {
    data.type = String(payload.data.type);
  }
  return data;
}

function showStaffOsNotification(title, body, data) {
  return self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    data: data || {},
  });
}

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "StaffOS Notification";
  const body = payload.notification?.body || "";
  return showStaffOsNotification(title, body, notificationDataFromPayload(payload));
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "Notification", body: event.data.text() } };
  }

  const title = payload?.notification?.title || "StaffOS Notification";
  const body = payload?.notification?.body || "";

  event.waitUntil(showStaffOsNotification(title, body, notificationDataFromPayload(payload)));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const applicationId = event.notification.data?.applicationId;
  const type = event.notification.data?.type;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.postMessage({
            type: "staffos-open-comment-session",
            applicationId: applicationId || null,
            notificationType: type || null,
          });
          return client.focus();
        }
      }
      return clients.openWindow(self.location.origin);
    }),
  );
});
