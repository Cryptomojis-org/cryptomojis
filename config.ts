import CollectibleCryptomoji from './build/contracts/CollectibleCryptomoji.json';

export const CONTRACT_ADDRESS = CollectibleCryptomoji.networks['5777'].address;

export const TODO_LIST_ABI = JSON.parse(JSON.stringify(CollectibleCryptomoji.abi));

