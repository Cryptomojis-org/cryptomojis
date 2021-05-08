import ipfsClient from 'ipfs-http-client';
// using the infura.io node, otherwise ipfs requires you to run a daemon on your own computer/server. See IPFS.io docs
// https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#readme
// or using options
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});


export default ipfs;


