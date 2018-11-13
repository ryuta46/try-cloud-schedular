import {Block, BlockHeight, BlockHttp, ChainHttp, TransactionTypes, TransferTransaction} from "nem-library";
import {Store} from "./store";
import {Logger} from "./logger";
import {Notifier} from "./notifier";


export class BlockMonitorApp {

    constructor(readonly store: Store, readonly notifier: Notifier, readonly logger: Logger ){};

    async run() {
        const lastBlock = await this.store.loadLastBlock();
        const currentBlock = await this.getBlockHeight();

        if (lastBlock === null) {
            this.logging(`No last block.`);
            await this.store.saveLastBlock(lastBlock);
            return;
        }

        if (lastBlock === currentBlock) {
            this.logging(`No new block from ${lastBlock}`);
            return;
        }

        const blocks = await this.getBlocksInRange(lastBlock + 1, currentBlock);
        const addresses = await this.store.loadWatchedAddresses();

        await this.notifyIfRelated(blocks, addresses);

        await this.store.saveLastBlock(currentBlock);
    }
    private logging(message) {
        this.logger.log(message);
    }

    private async getBlockHeight(): Promise<BlockHeight> {
        this.logging(`getBlockHeight`);
        const chainHttp = new ChainHttp();
        return chainHttp.getBlockchainHeight().toPromise();
    }

    private async getBlockByHeight(height: BlockHeight): Promise<Block> {
        this.logging(`getBlockByHeight: ${height}`);
        const blockHttp = new BlockHttp();
        return blockHttp.getBlockByHeight(height).toPromise();
    }

    private async getBlocksInRange(startHeight: BlockHeight, endHeight: BlockHeight): Promise<Block[]> {
        this.logging(`getBlocksInRange ${startHeight} .. ${endHeight}`);
        const tasks = Array.from(Array(1 + endHeight - startHeight).keys())
            .map(value => value + startHeight )
            .map( height => this.getBlockByHeight(height));

        return Promise.all(tasks);
    }

    private async notifyIfRelated(blocks: Block[], addresses: string[]) {
        this.logging(`Checking ${blocks.length} blocks, address: ${addresses}`);
        blocks.forEach((block) => {
            this.logging(`Checking block ${block.height} ....`);
            block.transactions.forEach(async (transaction) => {
                if (transaction.type === TransactionTypes.TRANSFER) {
                    const transferTransaction = transaction as TransferTransaction;
                    const sender = transaction.signer;
                    this.logging(`Sender ${sender.address.plain()}`);
                    if (addresses.indexOf(sender.address.plain()) >= 0) {
                        const message = `Sent ${transferTransaction.xem().quantity}`;
                        await this.notifier.post(message);
                    } else if (addresses.indexOf(transferTransaction.recipient.plain()) >= 0){
                        const message = `Receive ${transferTransaction.xem().quantity}`;
                        await this.notifier.post(message);
                    }
                }
            });
            this.logging(`Checked block ${block.height}`);
        });
    }
}


