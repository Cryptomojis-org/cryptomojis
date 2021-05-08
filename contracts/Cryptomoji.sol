// SPDX-License-Identifier: MIT
// https://docs.soliditylang.org/en/v0.8.3/

pragma solidity ^0.8.3;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract CollectibleCryptomoji is ERC721URIStorage, Ownable {
    using Strings for string;

    address public adminAddress;
    string public contractMetadata;

    struct Cryptomoji {
        uint256 id;
        string name;
        string hash; // SHA256 hash for IPFS (eg. QmYjh5NsDc6LwU3394NbB42WpQbGVsueVSBmod5WACvpte)
        // uint256 size; // file size in bytes (emojis must be under 256kb in size)
        // string format; // jpg | png | gif
        // link to IPFS gateway (eg. https://gateway.ipfs.io/ipfs/QmYjh5NsDc6LwU3394NbB42WpQbGVsueVSBmod5WACvpte)
        // OR https://ipfs.io/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8
    }

    Cryptomoji[] public cryptomojis;

    // Mapping from Cryptomoji name/hash/tokenURI to existence true or false
    mapping(string => bool) _nameExists;
    mapping(string => bool) _hashExists;
    mapping(string => bool) _tokenURIExists;

    event CryptomojiCreated(
        uint id,
        string name,
        string hash
    );

    constructor() ERC721('Cryptomojis', 'CM') {
        // the creator of the contract is the initial admin
        adminAddress = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminAddress);
        _;
    }

    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0));

        adminAddress = _newAdmin;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            'ERC721: caller is not owner nor approved'
        );
        require (bytes(_tokenURI).length > 0, 'TokenURI must not be empty.');


        _setTokenURI(tokenId, _tokenURI);
    }

    function setHash(uint256 tokenId, string memory _hash) public {
        require(!_hashExists[_hash], "Cryptomojis require unique file hashes.");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            'ERC721: caller is not owner nor approved'
        );
        cryptomojis[tokenId].hash = _hash;
    }

    function setHashAndTokenURI(uint256 tokenId, string memory _hash, string memory _tokenURI) public {
        require(!_hashExists[_hash], "Cryptomojis require unique file hashes.");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            'ERC721: caller is not owner nor approved'
        );
        setHash(tokenId, _hash);
        setTokenURI(tokenId, _tokenURI);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function contractURI() public view returns (string memory) {
        // https://docs.opensea.io/docs/contract-level-metadata
        return contractMetadata;
    }

    function setContractURI(string memory _contractURI) public onlyAdmin {
        contractMetadata = _contractURI;
    }

    function totalSupply() public view returns (uint256) {
        return cryptomojis.length;
    }

    function getCryptomoji(uint256 _id) external view returns (
    uint256 id,
    string memory name,
    string memory hash,
    string memory metadata,
    address owner
    ) {
        id = cryptomojis[_id].id;
        name = cryptomojis[_id].name;
        hash = cryptomojis[_id].hash;
        metadata = tokenURI(_id);
        owner = ownerOf(_id);
        return (id, name, hash, metadata, owner);
    }

    function mint(
        string memory _name,
        string memory _hash,
        string memory _tokenURI
    ) public {
        uint length = bytes(_name).length;
        // Require unique and valid cryptomoji
        require(!_nameExists[_name], "Cryptomojis require unique names.");
        require( 1 <= length && length <= 24, "Cryptomojis require names between 1 and 24 characters long.");
        require(testStr(_name), "Cryptomojis require names with lowercase alphanumeric characters (0-9, a-z).");
        require(!_hashExists[_hash], "Cryptomojis require unique file hashes.");
        require(!_tokenURIExists[_tokenURI], "Cryptomojis require unique tokenURIs.");

        uint256 _id = cryptomojis.length;

        cryptomojis.push(
            Cryptomoji(_id, _name, _hash)
        );

        _safeMint(msg.sender, _id);
        _setTokenURI(_id, _tokenURI);
        _nameExists[_name] = true;
        _hashExists[_hash] = true;
        _tokenURIExists[_tokenURI] = true;
        emit CryptomojiCreated(_id, _name, _hash);
    }

    // https://www.asciitable.com/
    function testStr(string memory str) public pure returns (bool){
        bytes memory b = bytes(str);
        if (b.length > 13) return false;
        for (uint i; i < b.length; i++) {
            bytes1 char = b[i];
            if (
                !(char >= 0x30 && char <= 0x39) && //9-0
                // !(char >= 0x41 && char <= 0x5A) && //A-Z
                !(char >= 0x61 && char <= 0x7A) //a-z
                // !(char == 0x2D) && // -
                // !(char == 0x5f) // _
            )
                return false;
        }
        return true;
    }
}