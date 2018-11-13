// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


import * as functions from 'firebase-functions';

import {
    NEMLibrary,
    NetworkTypes,
} from "nem-library";
import * as admin from 'firebase-admin';
import {ConsoleLogger, QueuedLogger} from "./logger";
import {BlockMonitorApp} from "./app";
import {FirestoreStore} from "./store";
import {SlackNotifier} from "./notifier";

admin.initializeApp(functions.config().firebase);

function initializeLibrary() {
    // Initialize NEMLibrary for TEST_NET Network
    try {
        //NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
        NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
    } catch (e) {
        // ignore initialization error.
    }
}

export const monitorNemBlockManual = functions.https.onRequest(async (request, response) => {
    initializeLibrary();
    const store = new FirestoreStore();
    const notifier = new SlackNotifier(await store.loadWebHookURL());
    const logger = new QueuedLogger();

    const app = new BlockMonitorApp(store, notifier, logger);
    await app.run();
    response.send( logger.queuedLog.join('\n') + "\n\n");
});


export const monitorNemBlockFunc = functions.pubsub.topic("monitor-nem-block").onPublish(async (msg) => {
    initializeLibrary();
    const store = new FirestoreStore();
    const notifier = new SlackNotifier(await store.loadWebHookURL());
    const logger = new ConsoleLogger();

    const app = new BlockMonitorApp(store, notifier, logger);
    await app.run();
});


