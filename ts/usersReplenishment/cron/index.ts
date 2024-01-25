import { CronJob } from 'cron';
import { connect } from 'mongoose';
import config from '../../config.js';
import EthService from '../service/ethService.js';
import ВtcService from '../service/btcService.js';
import WalletUser from '../../model/v1/modelWallet.js';
import ActiveUsersList from '../../model/v1/modelActiveUsersList.js';
import { Replenishment, ReplenishmentHash, ReplenishmentСommission } from '../../model/v1/modelReplenishment.js';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const CheckUsersBalanceBtc = new CronJob("0 */5 * * * *", async () => {
    console.log("start cron CheckUsersBalanceBtc");
    const activeUsers = (await ActiveUsersList.findOne({ date: new Date().toLocaleDateString("ua") })).usersList;
    for (let i = 0; i < activeUsers.length; i++) {
        const walletUser = await WalletUser.findOne({ id: activeUsers[i].id });
        if (walletUser.btc.address === config.wallet.btc.address) continue;
        await sleep(5000).then(async () => await ВtcService.WalletBalanceCheck(walletUser.id, walletUser.btc.privateKey, walletUser.btc.address));
    }
}, null, true, 'Europe/Moscow');

const CheckReplenishmentRequestsBtc = new CronJob("30 */2 * * * *", async () => {
    console.log("start cron CheckReplenishmentRequestsBtc");
    const replenishments = await Replenishment.find({ coin: "btc" });
    replenishments.map(async (r) => await sleep(5000).then(async () => await ВtcService.CheckReplenishmentRequests(r)));
}, null, true, 'Europe/Moscow');

const CheckUsersBalanceEth = new CronJob("0 */1 * * * *", async () => {
    console.log("start cron CheckUsersBalanceEth");
    const activeUsers = (await ActiveUsersList.findOne({ date: new Date().toLocaleDateString("ua") })).usersList;
    for (let i = 0; i < activeUsers.length; i++) {
        const walletUser = await WalletUser.findOne({ id: activeUsers[i].id });
        if (walletUser.eth.address === config.wallet.eth.address) continue;
        await sleep(5000).then(async () => await EthService.WalletBalanceCheck(walletUser.id, walletUser.eth.privateKey, walletUser.eth.address));
    }
}, null, true, 'Europe/Moscow');

const CheckReplenishmentRequestsEth = new CronJob("30 */2 * * * *", async () => {
    console.log("start cron CheckReplenishmentRequestsEth");
    const replenishments = await Replenishment.find({ coin: "eth" });
    replenishments.map(async (r) => await sleep(5000).then(async () => await EthService.CheckReplenishmentRequests(r)));
}, null, true, 'Europe/Moscow');

const CheckUsersBalanceTron = new CronJob("0 */5 * * * *", async () => {
    console.log("start cron CheckUsersBalanceTron");
    const activeUsers = (await ActiveUsersList.findOne({ date: new Date().toLocaleDateString("ua") })).usersList;
    for (let i = 0; i < activeUsers.length; i++) {
        const walletUser = await WalletUser.findOne({ id: activeUsers[i].id });
        if (walletUser.trc.address === config.wallet.trc.address) continue;
        await sleep(5000).then(async () => await EthService.WalletBalanceCheck(walletUser.id, walletUser.trc.privateKey, walletUser.trc.address));
    }
}, null, true, 'Europe/Moscow');

const CheckReplenishmentRequestsTron = new CronJob("30 */2 * * * *", async () => {
    console.log("start cron CheckReplenishmentRequestsTron");
    const replenishments = await Replenishment.find({ coin: "tron" });
    replenishments.map(async (r) => await sleep(5000).then(async () => await EthService.CheckReplenishmentRequests(r)));
}, null, true, 'Europe/Moscow');

function start() {
    connect(config.mongoUrl);
    console.log("start cron");
    CheckUsersBalanceBtc.start();
    CheckReplenishmentRequestsBtc.start();

    CheckUsersBalanceEth.start();
    CheckReplenishmentRequestsEth.start();

    CheckUsersBalanceTron.start();
    CheckReplenishmentRequestsTron.start();
}
start();