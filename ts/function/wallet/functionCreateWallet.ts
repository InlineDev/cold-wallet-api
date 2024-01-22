"use strict";
import Web3 from "web3";
import bip39 from "bip39";
import ethers from "ethers";
import bitcoin from "bitcoinjs-lib";
import config from "../../config.js";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";

const bip32 = BIP32Factory(ecc);

export function createBtc(mnemonic: string) {
  const path: string = `m/49'/0'/0'/0'`;
  const network = bitcoin.networks.bitcoin;

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let root = bip32.fromSeed(seed, network);

  let account = root.derivePath(path);
  let node = account.derive(0).derive(0);

  let btcAddress = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  }).address

  return {
    btcAddress,
    privateKey: node.privateKey.toString("hex")
  }
}

export function createEth(mnemonic: string) {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.web3provider));

  const privateKey: string = ethers.Wallet.fromMnemonic(mnemonic)._signingKey().privateKey;
  const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;

  return {
    address,
    privateKey
  }
}