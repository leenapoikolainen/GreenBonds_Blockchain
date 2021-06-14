// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenBond is ERC721, AccessControlEnumerable{
    using Counters for Counters.Counter;

    string private _baseTokenURI;
    Counters.Counter private _tokenIdTracker;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Will need to add pauser address as constructor parameter (financial regulator)
    constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721 (name, symbol) {
        _baseTokenURI = baseTokenURI;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Needed to override this function as two parent classes defined the same function
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Requires that the minter has minter role
    // Automatically creates tokenURI with baseURI concatenated with TokenId
    function issueTokens(uint256 numberOfTokens, address to) public virtual {
        require(hasRole(MINTER_ROLE, _msgSender()), "Minter must have minter role to mint");

        for (uint i = 0; i < numberOfTokens; i++) {
            _mint(to, _tokenIdTracker.current());
            _tokenIdTracker.increment();
        }
    }
}