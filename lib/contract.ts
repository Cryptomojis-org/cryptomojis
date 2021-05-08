const contract = (name: string) => {
    const json = require(`../build/contracts/${name}.json`);
    const address = json.networks['5777'].address;
    const abi = JSON.parse(JSON.stringify(json.abi));
    console.log({address});
    return {address, abi};
};

export default contract;