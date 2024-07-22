const Users = require("../Modals/users");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
// const serviceAccount = require("path/to/serviceAccountKey.json");
const { getMessaging } = require("firebase-admin/messaging");

const initializeFirebaseAdmin = () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

  initializeApp({
    credential: applicationDefault(),
    projectId: "justask-ee06a",
  });
};

// const baseURL = `http://10.0.2.2:8001`
const baseURL = 'https://justask-backend.onrender.com'

const sendNotification = async (data) => {
  try {
    let userToNotify = await Users.findOne({ username: data.receiverId });
    if (userToNotify) {
      const message = {
        data: {
          notifee: JSON.stringify({
            body: data.type === 'image' ? 'image' : data.msg,
            title: data.senderId,
            type: data.type,
            android: {
              priority: 'high',
              channelId: 'test',
              pressAction: {
                id: 'default',
              },
              largeIcon: `${baseURL}/${data.profilePic}-.png`,
              circularLargeIcon: true,
              ...(data.type === 'image' && {
                style: {
                  type: 0,
                  picture: data.msg
                }
              }),
            },
          }),
          message: data.msg,
          filename: data.msg.filename ?? '',
          senderUsername: data.senderId,
          receiverUsername: data.receiverId,
          type: data.type,
          profilePic: data.profilePic,
        },
        android: {
          priority: 'high',
        },
        token: userToNotify.deviceToken,
      };
      const messaging = await getMessaging().send(message);
      console.log("Successfully sent message:", messaging, data.msg);
    }
  } catch (err) {
    console.log("Error sending message:", err);
  }
};

module.exports = {
  initializeFirebaseAdmin,
  sendNotification,
};
