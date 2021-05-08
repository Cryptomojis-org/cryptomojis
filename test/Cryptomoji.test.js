const Cryptomoji = artifacts.require('./Cryptomoji.sol');

require('chai').use(require('chai-as-promised')).should();

contract('Cryptomoji', (accounts) => {
    let contract

    before(async () => {
        contract = await Cryptomoji.deployed()
    });


    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = contract.address
            console.log({address})
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        });

        it('has a name', async () => {
            const name = await contract.name()
            console.log({name})
            assert.equal(name, 'Cryptomoji')
        });

        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            console.log({symbol})
            assert.equal(symbol, 'CRYPTOMOJI')
        });
    });

    describe('minting', async () => {
        it('creates a new token', async () => {
            const result = await contract.mint('#EC058E')
            // console.log({result})


            // SUCCESS
            // const totalSupply = await contract.totalSupply; // TODO find alternative current implementation of ERC721
            // assert.equal(totalSupply, 1)

            const event = result.logs[0].args
            // console.log({tokenId: event.tokenId});
            assert.equal(event.tokenId.toNumber(), 1, 'id is correct');
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct');
            assert.equal(event.to, accounts[0], 'to is correct');

            // FAILURE: cannot mint same cryptomoji twice
            await contract.mint('#EC058E').should.be.rejected;
        })
    })

    describe('indexing', async () => {
        it('lists colors', async () => {
            // Mint 3 more tokens
            await contract.mint('#5386E4')
            await contract.mint('#FFFFFF')
            await contract.mint('#000000')
            const totalSupply = await contract.totalSupply()

            let color
            let result = []

            for (var i = 1; i <= totalSupply; i++) {
                color = await contract.colors(i - 1)
                result.push(color)
            }

            let expected = ['#EC058E', '#5386E4', '#FFFFFF', '#000000']
            assert.equal(result.join(','), expected.join(','))
        })
    })
})
