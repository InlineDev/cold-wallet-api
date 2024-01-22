import { CronJob } from 'cron';
import { connect } from 'mongoose';
import config from '../../config.js';
import EthService from '../service/ethService.js';
import ВtcService from '../service/btcService.js';
import Eth_UsdtService from '../service/eth(usdt)Service.js';
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

// const CheckUsersBalanceEthUsdt = new CronJob("0 */1 * * * *", async () => {
//     console.log("start cron CheckUsersBalanceEthUsdt");
//     const activeUsers = (await ActiveUsersList.findOne({ date: new Date().toLocaleDateString("ua") })).usersList;
//     for (let i = 0; i < activeUsers.length; i++) {
//         const walletUser = await WalletUser.findOne({ id: activeUsers[i].id });
//         if (walletUser.eth.address === config.wallet.eth.address) continue;
//         await sleep(5000).then(async () => await Eth_UsdtService.WalletBalanceCheck(walletUser.id, walletUser.eth.privateKey, walletUser.eth.address));
//     }
// }, null, true, 'Europe/Moscow');

// const CheckReplenishmentСommissionRequestsEthUSdt = new CronJob("0 */2 * * * *", async () => {
//     console.log("start cron CheckReplenishmentСommissionRequestsEthUSdt");
//     const replenishmentСommissions = await ReplenishmentСommission.find({ coin: "usdt_erc20" });
//     for (let i = 0; i < replenishmentСommissions.length; i++) {
//         await sleep(5000)
//             .then(async () => {
//                 const walletUser = await WalletUser.findOne({ id: replenishmentСommissions[i].idUser });
//                 await Eth_UsdtService.CheckReplenishmentСommissionRequests(replenishmentСommissions[i], walletUser.eth.privateKey);
//             });
//     }
// }, null, true, 'Europe/Moscow');

// const CheckReplenishmentRequestsEthUsdt = new CronJob("30 */2 * * * *", async () => {
//     console.log("start cron CheckReplenishmentRequestsEthUsdt");
//     const replenishments = await Replenishment.find({ coin: "usdt_erc20" });
//     replenishments.map(async (r) => await sleep(5000).then(async () => await Eth_UsdtService.CheckReplenishmentRequests(r)));
// }, null, true, 'Europe/Moscow');

function start() {
    connect(config.mongoUrl);
    console.log("start cron");
    CheckUsersBalanceBtc.start();
    CheckReplenishmentRequestsBtc.start();

    CheckUsersBalanceEth.start();
    CheckReplenishmentRequestsEth.start();

    // CheckUsersBalanceEthUsdt.start();
    // CheckReplenishmentСommissionRequestsEthUSdt.start();
    // CheckReplenishmentRequestsEthUsdt.start();
}
start();