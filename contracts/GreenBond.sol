// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenBond is ERC721, AccessControlEnumerable, Ownable{
    using Counters for Counters.Counter;

    string private _baseTokenURI;
    Counters.Counter private _tokenIdTracker;

    event Invest(address investor, uint256 value);

    mapping (address => uint256) _investedAmountPerInvestor;

    address payable _company;
    uint256 _value;
    uint256 _coupon;
    uint256 _totalValue;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Will need to add pauser address as constructor parameter (financial regulator)
    constructor(string memory name, string memory symbol, string memory baseTokenURI, 
    address company, uint256 value, uint256 coupon) ERC721 (name, symbol) {
        _baseTokenURI = baseTokenURI;
        _company = payable(company);
        _value = value;
        _coupon = coupon;

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

    function invest(uint256 number) public payable {
        // Require that the investor has enough coins
        require(msg.value >= number * _value, "not enough coins for the amount");

        // Deposit the money --> BY DEFAULT ON THE CONTRACT
        // payable(address(this)).transfer(msg.value);
        
        // Register the investment
        uint256 currentAmount = _investedAmountPerInvestor[msg.sender];
        _investedAmountPerInvestor[msg.sender] = currentAmount + msg.value;
        // Emit event
        emit Invest(msg.sender, msg.value);
    }

    // Requires that the minter has minter role
    // Automatically creates tokenURI with baseURI concatenated with TokenId
    function issueTokens(uint256 numberOfTokens, address to) public payable {
        require(hasRole(MINTER_ROLE, _msgSender()), "Minter must have minter role to mint");

        // Transfer the money to the issuer
        require(msg.value >= _value * numberOfTokens, "Not enough money send for the tokens");
        _company.transfer(msg.value);
        _totalValue = _totalValue + msg.value;

        for (uint i = 0; i < numberOfTokens; i++) {
            _mint(to, _tokenIdTracker.current());
            _tokenIdTracker.increment();
        }
    }

    // WILL NEED TO ADD VALUE TRANSFER NEXT
    function IssuerTransfer(address from, address to, uint256 tokenId) internal {
        _transfer(from, to, tokenId);
    }

    /*
    function payCoupon() public payable {
        // Check that there's enough stable coin for the coupons
        require(msg.value >= _tokenIdTracker.current() * _coupon, "There's not enough stable coin for coupon settlement");
        for(uint i = 0; i < _tokenIdTracker.current(); i++) {
            address payable investor = payable(ownerOf(i));
            investor.transfer(_coupon);
        }
    }

    // This should be called by the borrowing company / or the issuer if they have the money back
    function  returnFaceValue() public payable {
        require(msg.value == _totalValue, "The amount needs to match the total value");
        // Money is back on the contract
        payable(address(this)).transfer(msg.value);
    }
    */

  

    function returnTokensAtMaturity() external onlyOwner {
        // Check that the contract has the right amount of money to send back to the investors
        require(address(this).balance >= _totalValue, "There's not enough stable coin for settlement");
        for(uint i = 0; i < _tokenIdTracker.current(); i++) {
            address payable investor = payable(ownerOf(i));
            // Get the tokens back
            IssuerTransfer(investor, owner(), i);
            // Return the stable coin value
            investor.transfer(_value);
            
        }
    }

}