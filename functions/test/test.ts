import {BlockMonitorApp} from "../src/app";
import {Store} from "../src/store";
import {ConsoleLogger} from "../src/logger";
import {NEMLibrary, NetworkTypes} from "nem-library";
import {ConsoleNotifier} from "../src/notifier";



NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

class DummyStore implements Store {
    async loadLastBlock(): Promise<number | null> {
        return 1722720;
    }

    async saveLastBlock(lastBlock: number): Promise<any> {
        return 0;
    }

    async loadWatchedAddresses(): Promise<string[]> {
        return ["TCRUHA3423WEYZN64CZ62IVK53VQ5JGIRJT5UMAE"];
    }

    async loadWebHookURL(): Promise<string> {
        return "";
    }
}



const app = new BlockMonitorApp(new DummyStore(), new ConsoleNotifier(), new ConsoleLogger());
app.run().then((result) => {
    console.log("end");
});
