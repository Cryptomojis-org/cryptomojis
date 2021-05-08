import Web3 from 'web3';
import {useWeb3React} from "@web3-react/core";
import {useEffect, useLayoutEffect, useState} from 'react';
import contract from '../lib/contract';
import {AbiItem} from 'web3-utils';
import Link from 'next/link';
import {stat} from 'fs';
import ipfs from '../lib/ipfs';
// import CryptoJS from 'crypto-js';
// import bs58 from 'bs58';


// TODO check check metamask https://docs.metamask.io/guide/create-dapp.html#basic-action-part-1
// TODO check Ethereum provider https://docs.metamask.io/guide/ethereum-provider.html#ethereum-provider-api

const {address, abi} = contract('CollectibleCryptomoji');

const Index = () => {
    const {account, library} = useWeb3React();
    const initialState = {
        loading: true,
        web3: undefined,
        metamaskInstalled: false,
        network: undefined,
        provider: undefined,
        account: undefined,
        cryptomojiContract: undefined,
        cryptomojis: [],
        totalCryptomojis: 0,
        error: undefined,

        // cryptomoji
        inputName: '',
        // file
        buffer: undefined,
        hash: undefined,
        format: undefined,
        size: undefined,
        // tokenURI
        metadata: {
            name: undefined, // "facepalm"
            image: undefined, // https://ipfs.io/ipfs/${hash}?filename=${name}.${format}",
        },
        tokenURI: undefined,
        readyToMint: false,
    };
    const [state, resetState] = useState(initialState);
    const setState = (changes) => {
        resetState({...state, ...changes});
    };

    const loadBlockchainData = async () => {
        setState({loading: true});
        console.log('Web3.givenProvider', JSON.parse(JSON.stringify(Web3.givenProvider)));
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const accounts = await web3.eth.getAccounts();
        const network = await web3.eth.net.getNetworkType();
        const {isMetaMask, chainId, networkVersion} = web3.eth.net.currentProvider as any;
        console.log({isMetaMask, chainId, networkVersion});
        console.log({abi, address});
        let cryptomojiContract;
        try {
            cryptomojiContract = new web3.eth.Contract(abi, address);
        } catch (error) {
            console.log('cryptomojiContract:error', error);
        }

        if (cryptomojiContract) {
            const totalCryptomojis = await cryptomojiContract.methods.totalSupply().call();

            let cryptomojis = [];
            for (let i = 0; i < totalCryptomojis; i++) {
                console.log(i);
                const cryptomoji = await cryptomojiContract.methods.getCryptomoji(i).call();
                console.log({cryptomoji});
                cryptomojis.push({
                    id: parseInt(cryptomoji.id),
                    name: cryptomoji.name,
                    format: cryptomoji.format,
                    hash: cryptomoji.hash,
                    metadata: cryptomoji.metadata,
                    owner: cryptomoji.owner,
                });
            }

            setState({
                loading: false,
                web3,
                network,
                account: accounts[0],
                cryptomojis,
                cryptomojiContract,
                totalCryptomojis,
            });
        }

    };


    const isMetaMaskInstalled = async () => {
        //Have to check the ethereum binding on the window object to see if it's installed
        // @ts-ignore
        const {ethereum} = window;
        const metamaskInstalled = ethereum && ethereum.isMetaMask;
        console.log('metamaskInstalled', metamaskInstalled);
        setState({metamaskInstalled});
    };

    const connectEthereum = () => {
        const {ethereum} = window as any;
        if (ethereum) {
            ethereum.enable();
        }
    };

    useEffect(() => {
        // isMetaMaskInstalled().then();
        loadBlockchainData().then();
    }, []);

    const createCryptomoji = async () => {
        setState({loading: true});
        const imageIPFS = await uploadIPFS(state.buffer);
        const hash = imageIPFS.path;
        console.log({imageIPFS, hash});

        const metadata = {
            name: state.inputName,
            image: `https://ipfs.io/ipfs/${hash}`,
        };
        const metadataString = JSON.stringify(metadata);
        const metadataBuffer = await Buffer.from(metadataString);
        const metadataIPFS = await uploadIPFS(metadataBuffer);
        const tokenURI = `https://ipfs.io/ipfs/${metadataIPFS.path}`;
        console.log({metadataIPFS, tokenURI});

        setState({metadata, hash, tokenURI});
        state.cryptomojiContract.methods.mint(state.inputName, hash, tokenURI).send({from: state.account})
            .once('receipt', (receipt) => {
                console.log('createCryptomoji', {receipt});
                setState({loading: false});
            })
            .catch(error => {
                let reason;
                try {
                    const error_str = error.stack;
                    const json_str = error_str.slice(63, error_str.length - 1);
                    let parsed_error = JSON.parse(json_str);
                    parsed_error = parsed_error.value.data.data;
                    reason = parsed_error[Object.keys(parsed_error)[0]].reason;
                } catch (other_error) {
                    console.log('other_error!');
                    console.log(other_error);
                    reason = 'An error happened! Try again!'
                }
                setState({error: reason, loading: false});
            });
    };

    const captureFile = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const file = event.target.files[0];
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => convertToBuffer(reader, file);
    };

    const convertToBuffer = async (reader, file) => {
        const format = (file.type).replace('image/', '').replace('jpeg', 'jpg');
        const size = file.size;

        //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer - using es6 syntax
        setState({buffer, format, size});
        console.log({format, size});
        // const sha256Checksum = CryptoJS.SHA256(buffer.toString()).toString();
        // console.log({sha256Checksum});
        // console.log({sha256Buffer: new Buffer(sha256Checksum, 'hex')});
        // console.log({bs58: bs58.encode(new Buffer(sha256Checksum, 'hex'))});
    };

    const uploadIPFS = async (buffer) => {
        return await ipfs.add(buffer, {
            progress: (progress) => console.log(`received: ${progress}`),
        });
    };

    const clipString = (_str, length = 5) => {
        return _str.slice(0, length) + '...' + _str.slice(-length, _str.length)
    }

    return (
        <div>
            <Link href={'/upload'}>/upload</Link>
            <p><b>Network:</b> {state.loading ? 'loading...' : 'ready'}</p>
            <p>
                <button onClick={() => isMetaMaskInstalled()}>Check metamask</button>
            </p>
            <p>{state.metamaskInstalled ?
                <button disabled>Metamask is installed</button>
                :
                <button>Install Metamask</button>
            }</p>

            <p>{state.account ?
                <button disabled>Metamask is connected</button>
                :
                <button onClick={() => connectEthereum()}>connect to Metamask</button>
            }</p>
            <p><b>Network:</b> {state.network && state.network}</p>
            <p><b>Network ID:</b> {state.provider?.networdId && state.provider.networkId}</p>
            <p><b>Contract Address:</b> {state.cryptomojiContract && state.cryptomojiContract['_address']}</p>
            <p><b>Account:</b> {state.account && state.account}</p>

            <input
                type="file"
                onChange={(e) => captureFile(e)}
            />
            <br/>
            <p>format: {state.format}</p>
            <p>size: {state.size}</p>

            <label>name</label><input value={state.inputName}
                                      onChange={(e) => setState({inputName: e.target.value})}/><br/>
            <button onClick={() => createCryptomoji()}>Add random cryptomoji</button>
            <p style={{color: 'red'}}>{state.error}</p>
            <p><b>Total count:</b> {state.totalCryptomojis}</p>
            <div>
                <b>Cryptomojis:</b>
                <ul>{state.cryptomojis.map(d => (
                    <li key={d.id}>
                        {d.id} - {d.name} - {d.owner}
                        <br/>
                        <a href={d.metadata} target='_blank'><img src={`https://ipfs.io/ipfs/${d.hash}`} height={50}/></a>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    );
};

export default Index;