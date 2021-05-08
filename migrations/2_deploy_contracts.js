const TodoList = artifacts.require('TodoList');
const Cryptomoji = artifacts.require('CollectibleCryptomoji');
const StoreHash = artifacts.require('StoreHash');

module.exports = function (deployer) {
  // deployer.deploy(TodoList);
  // deployer.deploy(StoreHash);
  deployer.deploy(Cryptomoji);
};
