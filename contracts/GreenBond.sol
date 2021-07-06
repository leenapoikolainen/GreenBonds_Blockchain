// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenBond is ERC721, Ownable{
    using Counters for Counters.Counter;


    /**
     * @dev Reverts if bidding time is not open
     */
    modifier onlyWhileInvestmentWindowOpen {
        require(isOpen(), "Investment window is not open");
        _;
    }

    /**
     * @dev Reverts if bidding time is still open
     */
    modifier onlyWhileInvestmentWindowClosed {
        require(!isOpen(), "Investment window is still open");
        _;
    }

     /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    string private _baseTokenURI;
    Counters.Counter private _tokenIdTracker;
    bool private _paused;

    // Array of initial investors
    address [] private _investors;

    address private _owner;
    address payable private _company;
    address private _regulator; 
    address private _greenVerifier;
    uint256 private _value;
    uint256 private _coupon;
    uint256 private _totalValueRaised;

    uint256 private _investmentWindowClosingTime;

    /**
     * @return true if the investment window is open, false otherwise.
     */
    function isOpen() public view returns (bool) {
        return block.timestamp <= _investmentWindowClosingTime;
    }

    /**
     * @dev Emitted when an investor registers initial investment request
     */
    event Investment(address investor, uint256 value, uint256 numberOfTokens);
    
    /**
     * @dev Emitted when coins are refunded to the investor in case there are
            too many coins for the investment or to the company if they pay too much 
            with coupons / principal repayment
     */
    event CoinRefund(address sender, uint256 value);
    
    /**
     * @dev Emitted when a coupon payment has been made
     */
    event CouponPayment(address investor, uint256 tokenId);

    /**
     * @dev Emitted when the pause is triggered by a pauser (regulator).
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by a pauser (regulator).
     */
    event Unpaused(address account);

    /**
     * @dev Emmitted when coupon payment is adjusted
     */
    event CouponAdjustment(address adjuster, uint256 couponRate);

    mapping (address => uint256) _investedAmountPerInvestor;
    mapping (address => uint256) _requestedTokensPerInvestor;
    
    // Will need to add pauser address as constructor parameter (financial regulator)
    constructor(string memory name, string memory symbol, string memory baseTokenURI, 
    address company, uint256 value, uint256 coupon, uint256 investmentWindowClosingTime) ERC721 (name, symbol) {
        require(coupon >= 0, "Coupon payment can't be negative");
        _owner = msg.sender;
        _baseTokenURI = baseTokenURI;
        _company = payable(company);
        _value = value;
        _coupon = coupon;
        _paused = false;
        _investmentWindowClosingTime = investmentWindowClosingTime;     
    }

    function getCompany() public view returns (address) {
        return _company;
    }

    function getInvestmentWindowClosingTime() public view returns (uint256) {
        return _investmentWindowClosingTime;
    }

    function setRegulator(address regulator) public onlyOwner {
        _regulator = regulator;
    }
    
    function setGreenVerifier(address greenVerifier) public onlyOwner {
        _greenVerifier = greenVerifier;
    }

    function getRegulator() public view returns(address) {
        return _regulator;
    }

    function getGreenVerifier() public view returns(address) {
        return _greenVerifier;
    }

    function getValue() public view returns(uint256) {
        return _value;
    }

    function getCoupon() public view returns(uint256) {
        return _coupon;
    }

    function getTotalLoan() public view returns(uint256) {
        return _totalValueRaised;
    }

    function numberOfInvestors() public view returns(uint256) {
        return _investors.length;
    }
    
    function tokenCount() public view returns(uint256) {
        return _tokenIdTracker.current();
    }
    
    function getName() public view returns(string memory) {
        return name();
    } 

    function getInvestorBalance(address investor) public view returns (uint){
        require(investor != address(0), "Balance query for the zero address");
        return _investedAmountPerInvestor[investor];
    }


    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Needed to override this function as two parent classes defined the same function
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Function to register investment interest 
    // Investors specifies the number of tokens they would like to receive 
    function registerInvestment(uint256 number) public payable onlyWhileInvestmentWindowOpen {
        // Require that the investor has enough coins
        require(msg.value >= number * _value, "not enough coins for the amount");

        // Check if investor already on the list
        if (_investedAmountPerInvestor[msg.sender] == 0) {
            _investors.push(msg.sender);
        }
        
        // Register the investment
        uint256 currentAmount = _investedAmountPerInvestor[msg.sender];
        _investedAmountPerInvestor[msg.sender] = currentAmount + msg.value;
        _requestedTokensPerInvestor[msg.sender] = _requestedTokensPerInvestor[msg.sender] + number;

        // Emit event
        emit Investment(msg.sender, msg.value, number);
    }


    /**
     * @dev Function to issue tokens for investors who have registered 
        Assumes all investors will get the requested investment
        Can be called only when bidding time is closed and the contract is unpaused
     */
    function issueTokens() public onlyWhileInvestmentWindowClosed whenNotPaused {
        require(msg.sender == _owner, "Only owner can mint tokens");
       
        // Iterate through each investor
        for (uint i = 0; i < _investors.length; i++) {
            address investor = _investors[i];
            uint256 numberOfTokens = _requestedTokensPerInvestor[investor];
            // Transfer money to the borrowing company
            _company.transfer(_value * numberOfTokens); 
            

            // Issue tokens
            for (uint j = 0; j < numberOfTokens; j++) {  
                _mint(investor, _tokenIdTracker.current());
                _tokenIdTracker.increment();
            }

            // If the invested amount would be greated than the amount needed for investment
            // Return the remainder back to the investor
            if (_investedAmountPerInvestor[investor] > numberOfTokens * _value) {
                payable(investor).transfer(_investedAmountPerInvestor[investor] - numberOfTokens * _value);
                emit CoinRefund(investor, _investedAmountPerInvestor[investor] - numberOfTokens * _value);
            }

            // Update the records
            _investedAmountPerInvestor[investor] = 0;
            _requestedTokensPerInvestor[investor] = 0;
            _totalValueRaised = _totalValueRaised + _value * numberOfTokens;
  
        }
    }

    /**
     * @dev Function for regulator to return all money to investors
        if there are any issues with the borrowing company
     */
    function returnInvestorMoney() public whenPaused {
        require(msg.sender == _regulator, "Only regulator can return investments");
        for (uint i = 0; i < _investors.length; i++) {
            address investor = _investors[i];
            payable(investor).transfer(_investedAmountPerInvestor[investor]);
        }
    }

    // Function for the borrowing company to pay coupons
    function payCoupons() public payable {
        // Message needs to have enough value for the copupon payments
        require(msg.sender == _company, "Coupon payment should come from the borrowing company");
        require(msg.value >= _coupon * _tokenIdTracker.current(), "Not enough coins for coupons");
        for (uint i = 0; i < _tokenIdTracker.current(); i++) {
            address payable investor = payable(ownerOf(i));
            investor.transfer(_coupon);
            emit CouponPayment(investor, i);
        }

        // Refund extra coins if paid too much
        if (msg.value > _coupon * _tokenIdTracker.current()) {
            uint256 extraAmount = msg.value - _coupon * _tokenIdTracker.current();
            payable(msg.sender).transfer(extraAmount);
            emit CoinRefund(msg.sender, extraAmount);
        }
    }

    // This function should be called by the borrowing company
    function payBackBond() public payable {
        require(msg.sender == _company, "Paying company should be the borrowing company");
        require(msg.value >= _totalValueRaised, "Not enough coins to settle the bond at maturity");
        
        // Interate through the tokens
        uint256 numberOfTokens = _tokenIdTracker.current();
        for(uint i = 0; i < numberOfTokens; i++) {
            address payable investor = payable(ownerOf(i));
            // Transfer token from investor to owner
            tokenTransfer(investor, _owner, i);
            // Return funds
            investor.transfer(_value);
            // Decrement the values
            _totalValueRaised = _totalValueRaised - _value;
            _tokenIdTracker.decrement();
        }
        

        // Refund coins there is extra money on the contract
        if (address(this).balance > 0 && msg.value > _totalValueRaised) {
            uint256 extraAmount = msg.value - _totalValueRaised;
            if(address(this).balance < extraAmount) {
                uint256 amount = address(this).balance;
                payable(msg.sender).transfer(amount);
                emit CoinRefund(msg.sender, amount);
            } else {
                payable(msg.sender).transfer(extraAmount);
            emit CoinRefund(msg.sender, extraAmount);
            }
        }
    
    }

    // Internal function to transer the tokens
    function tokenTransfer(address from, address to, uint256 tokenId) internal {
        _transfer(from, to, tokenId);
    }

    // Pauser functions
    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

   

    /**
     * @dev Called by a pauser to pause, triggers stopped state.
     */
    function pause() public whenNotPaused {
        require(msg.sender == _regulator, "Pauser can only be the regulator");
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Called by a pauser to unpause, returns to normal state.
     */
    function unpause() public whenPaused {
        require(msg.sender == _regulator, "Unpauser can only be the regulator");
        _paused = false;
        emit Unpaused(_msgSender());
    }

    function adjustCoupon(bool increase, uint256 amount) public {
        require(msg.sender == _greenVerifier);
        if (increase){
            _coupon = _coupon + amount;
        } else {
            require(amount <= _coupon, "Coupon payment can't be negative");
            _coupon = _coupon - amount;
        }
        emit CouponAdjustment(msg.sender, _coupon);
    }

}