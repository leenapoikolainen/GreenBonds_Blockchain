pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Bond is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 _numberOfTokens;
    uint256 _value;
    address _owner;

    mapping (uint256 => string) private _tokenURIs;

    constructor(uint numberOfTokens, uint value) public ERC721("Bond", "B") {
        _numberOfTokens = numberOfTokens;
        _value = value;
        _owner = msg.sender;
    }

    function getOwner() public view returns (address){
        return _owner;
    }

    function getValue() public view returns(uint256) {
        return _value;
    }

    function createTokens() public  {
        for (uint i = 0; i < _numberOfTokens; i++) {
            _tokenIds.increment();

            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);
        }
    }
}