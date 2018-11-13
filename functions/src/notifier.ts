
import fetch from 'node-fetch';

export interface Notifier {
    post(text: String): Promise<any>;
}


export class SlackNotifier implements Notifier{
    constructor(readonly webHookUrl: string){ }

    async post(text: String): Promise<any> {
        const body = `payload={\"text\": \"${text}\"}`;
        return fetch(this.webHookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: body
        });

    }
}

export class ConsoleNotifier implements Notifier {
    async post(text: String): Promise<any> {
        console.log(text);
        return;
    }
}
