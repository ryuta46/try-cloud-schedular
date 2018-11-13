
import * as admin from 'firebase-admin';

export interface Store {
    loadLastBlock(): Promise<number | null>;
    saveLastBlock(lastBlock: number): Promise<any>;

    loadWatchedAddresses(): Promise<string[]>;

    loadWebHookURL(): Promise<string>
}


export class FirestoreStore implements Store {
    async loadLastBlock(): Promise<number | null> {
        const blockHeight = await admin.firestore().collection("block").doc("height").get();
        if (!blockHeight.exists) {
            return null;
        }
        const blockHeightData = blockHeight.data();
        return blockHeightData['last'];
    }

    async saveLastBlock(lastBlock: number): Promise<any> {
        const blockHeightRef = await admin.firestore().collection("block").doc("height");
        return blockHeightRef.set({
            last: lastBlock
        });
    }

    async loadWatchedAddresses(): Promise<string[]> {
        const addresses = await admin.firestore().collection("watched").doc("addresses").get();
        if (!addresses.exists) {
            return [];
        }

        const addressesData = addresses.data();
        return addressesData['values'];
    }

    async loadWebHookURL(): Promise<string> {
        const setting = await admin.firestore().collection("meta").doc("setting").get();
        if (!setting.exists) {
            return "";
        }

        const settingData = setting.data();
        return settingData['webHookUrl'];

    }

}

