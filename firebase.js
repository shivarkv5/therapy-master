let admin = require('firebase-admin')
let serviceAccount = require('./fcm.json')
admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification =(title,body)=>{
    const fcm = admin.messaging();
    const payload = admin.messaging.MessagingPayload = {
        notification: {
            title,
            body,
            icon: 'your-icon-url',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK' // required only for onResume or onLaunch callbacks
        }
    };
    console.log(payload)
    fcm.sendToTopic('notify', payload).then(dat => console.log).catch(e => console.log)
    
}
// const ScheduledEventEmitter = require('scheduled-event-emitter');
// const emitter = new ScheduledEventEmitter();
// setInterval(() => {
//     if (new Date().getHours() === 9 && new Date().getMinutes() === 21)
//         fcm.sendToTopic('notify', payload).then(dat => console.log).catch(e => console.log)
// }, 40000)
