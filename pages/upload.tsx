import Link from 'next/link';
import Web3 from 'web3';
import {useWeb3React} from "@web3-react/core";
import {useEffect, useLayoutEffect, useState} from 'react';
import contract from '../lib/contract';
import ipfs from '../lib/ipfs';
// import IPFS from 'ipfs-core';
import {AbiItem} from 'web3-utils';
import CryptoJS from 'crypto-js';


// TODO check check metamask https://docs.metamask.io/guide/create-dapp.html#basic-action-part-1
// TODO check Ethereum provider https://docs.metamask.io/guide/ethereum-provider.html#ethereum-provider-api

const {address, abi} = contract('StoreHash');

const Index = () => {
    const {account, library} = useWeb3React();
    const initialState = {
        loading: true,
        metamaskInstalled: false,
        network: undefined,
        provider: undefined,
        account: undefined,
        ethContract: undefined,
        ipfsHash: undefined,
        transactionHash: undefined,
        blockNumber: undefined,
        gasUsed: undefined,

        //file
        buffer: undefined,
    };
    const [state, resetState] = useState(initialState);
    const setState = (changes) => {
        resetState({...state, ...changes});
    };

    const loadBlockchainData = async () => {
        setState({loading: true});
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const accounts = await web3.eth.getAccounts();
        const network = await web3.eth.net.getNetworkType();
        const provider = await web3.eth.net.currentProvider;
        const {isMetaMask, chainId, networkVersion} = web3.eth.net.currentProvider as any;
        console.log({isMetaMask, chainId, networkVersion});
        console.log({abi, address});
        const ethContract = new web3.eth.Contract(abi, address) as any;


        setState({
            loading: false,
            network,
            provider,
            account: accounts[0],
            ethContract: ethContract,
        });
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

    const captureFile = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const file = event.target.files[0];
        console.log({file});
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => convertToBuffer(reader);
    };

    const convertToBuffer = async (reader) => {
        //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer -using es6 syntax
        setState({buffer});
    };

    const uploadIPFS = async (event) => {
        event.preventDefault();
        // const ipfs = await IPFS.create(); // use if using 'ipfs-core' when working locally with IPFS
        // const sha256Checksum = CryptoJS.SHA256(state.buffer.toString()).toString();
        const result = await ipfs.add(state.buffer, {
            progress: (progress) => console.log(`received: ${progress}`)
        });
        console.log({ipfsAddResult: result});
    };

    return (
        <div>
            <Link href={'/'}>/index</Link>
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
            <p><b>Network ID:</b> {state.provider?.networkVersion && state.provider.networkVersion}</p>
            <p><b>Contract Address:</b> {state.ethContract && state.ethContract['_address']}</p>
            <p><b>User Account:</b> {state.account && state.account}</p>

            <br/>
            <input
                type="file"
                onChange={(e) => captureFile(e)}
            />
            <button type="submit" onClick={(e) => uploadIPFS(e)}>Upload to IPFS</button>
            <hr/>
            <br/>
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Tx Receipt Category</th>
                        <th>Values</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>IPFS Hash # stored on Eth Contract</td>
                        <td>{state.ipfsHash || '...'}</td>
                    </tr>
                    <tr>
                        <td>Tx Hash #</td>
                        <td>{state.transactionHash || '...'}</td>
                    </tr>

                    <tr>
                        <td>Block Number #</td>
                        <td>{state.blockNumber || '...'}</td>
                    </tr>

                    <tr>
                        <td>Gas Used</td>
                        <td>{state.gasUsed || '...'}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Index;