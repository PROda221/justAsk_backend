const Users = require("../Modals/users");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
// const serviceAccount = require("path/to/serviceAccountKey.json");
const { getMessaging } = require("firebase-admin/messaging");

const initializeNotifications = () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

  initializeApp({
    credential: applicationDefault(),
    projectId: "justask-ee06a",
  });
};

const sendNotification = async (data) => {
  try {
    let userToNotify = await Users.findOne({ username: data.receiverId });
    if (userToNotify) {
      const message = {
        data: {
            senderUsername: data.senderId,
            message: data.msg,
            type: data.type
        },
        notification: {
          title: data.senderId,
          body: data.msg,
        },
        token: userToNotify.deviceToken,
      };
      const messaging = await getMessaging().send(message);
      console.log("Successfully sent message:", messaging);
    }
  } catch (err) {
    console.log("Error sending message:", err);
  }
};

module.exports = {
  initializeNotifications,
  sendNotification,
};
