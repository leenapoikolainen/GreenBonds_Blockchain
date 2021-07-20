// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenBond is ERC721, Ownable {
    using Counters for Counters.Counter;

    // MODIFIERS
    /**
     * @dev Reverts if bidding time is not open
     */
    modifier onlyWhileBiddingWindowOpen {
        require(biddingWindowisOpen(), "Investment window is not open");
        _;
    }

    /**
     * @dev Reverts if bidding time is still open
     */
    modifier onlyWhileBiddingWindowClosed {
        require(!biddingWindowisOpen(), "Investment window is still open");
        _;
    }


    // MEMBER VARIABLES

    Counters.Counter private _bondIdTracker;
    string private _baseBondURI;
    // Boolean variable that is only set true if there is enough demand for bond
    bool private _coupondefined = false;
    // List of initial investors who have bidded at 'right coupon level'
    address[] private _initialInvestors;
    address private _owner;
    address payable private _company;
    uint256 private _value;
    uint256 private _numberOfBondsSeeked;
    uint256 private _coupon;
    uint256 private _minCoupon;
    uint256 private _maxCoupon;
    uint256 private _term;
    uint256 private _totalCouponPayments;
    uint256 private _couponsPaid = 0; // Zero in the beginning
    uint256 private _totalDebt;
    uint256 private _bidClosingTime;
    uint256 private _issueDate;
    uint256 private _maturityDate;
    uint256 private _actualPrincipalPaymentDate = 0; // Initialise to 0
    uint256 private _couponsPerYear;
    // Dates for the agreed coupon payments
    uint256[] private _couponPaymentDates;
    // Dates when the actual couons were paid
    uint256[] private _actualCouponPaymentDates;

    mapping(address => uint256) _investedAmountPerInvestor;
    mapping(address => uint256) _requestedBondsPerInvestor;

    mapping(uint256 => uint256) _bidsPerCoupon;
    mapping(uint256 => address[]) _investorListAtCouponLevel;
    mapping(address => mapping(uint256 => uint256)) _bidsPerInvestorAtCouponLevel;
    mapping(address => bool) _biddedInvestors;

    /**
     * @dev Emitted when an investor registers initial investment request
     */
    event Investment(address investor, uint256 value, uint256 numberOfBonds);

    /**
     * @dev Emitted when coins are refunded to the investor in case there are
            too many coins for the investment or to the company if they pay too much 
            with coupons / principal repayment
     */
    event CoinRefund(address account, uint256 value);

    /**
     * @dev Emitted when a coupon payment has been made
     */
    event CouponPayment(address investor, uint256 bondId);


    /**
     * @dev Emmitted when coupon payment is adjusted
     */
    event CouponAdjustment(address adjuster, uint256 couponRate);
    event CouponSet(uint256 coupon);
    event CancelBondIssue(uint256 actualDemand, uint256 requestedDemand);
    event Bid(address bidder, uint256 coupon, uint256 numberOfBonds);

    /**
     * @dev constructor, requires name and symbol for the bond,
     * base URI for metadata, company address, facevalue for one bond / min investment
     * coupon amount, investment window closing time
     */
    constructor(
        address company,
        string memory name,
        string memory symbol,
        uint256 numberOfBondsSeeked,
        uint256 minCoupon,
        uint256 maxCoupon,
        uint256 bidClosingTime,
        uint256 term,
        uint256 couponsPerYear,
        string memory baseBondURI
    ) ERC721(name, symbol) {
        require(company != address(0), "Company address can not be 0x0");
        require(minCoupon >= 0, "coupon can't be negative");
        require(
            maxCoupon > minCoupon,
            "max coupon needs to be greater than min coupon"
        );
        require(
            bidClosingTime > block.timestamp,
            "Closing time can't be in the past"
        );
        _owner = msg.sender;
        _baseBondURI = baseBondURI;
        _company = payable(company);
        _value = 100; // Face value default at 100
        _numberOfBondsSeeked = numberOfBondsSeeked;
        _coupon = 0; // by default 0
        _minCoupon = minCoupon;
        _maxCoupon = maxCoupon;
        _bidClosingTime = bidClosingTime;
        _issueDate = _bidClosingTime + 1 weeks;
        _term = term;
        _couponsPerYear = couponsPerYear;
        _totalCouponPayments = couponsPerYear * term;

        _maturityDate = _issueDate + term * 365 days;

        uint256 timeBetweenpayments = 365 days / couponsPerYear;

        // Setting up the coupon payment dates
        for (uint256 i = 1; i <= _totalCouponPayments; i++) {
            _couponPaymentDates.push(_issueDate + timeBetweenpayments * i);
            _actualCouponPaymentDates.push(0);
        }
    }

    // Getter functions

    function getBidClosingTime() external view returns (uint256) {
        return _bidClosingTime;
    }

    function getIssueDate() public view returns (uint256) {
        return _issueDate;
    }

    function getMaturityDate() public view returns (uint256) {
        return _maturityDate;
    }

    function getTerm() public view returns (uint256) {
        return _term;
    }

    function getCouponDate(uint256 number) public view returns (uint256) {
        require(
            number > 0 && number <= _totalCouponPayments,
            "No such coupon payment, check the number of coupon payments"
        );
        return _couponPaymentDates[number - 1];
    }

    function getCouponDates() public view returns (uint256[] memory) {
        return _couponPaymentDates;
    }

    function getCompany() public view returns (address) {
        return _company;
    }

    function getFaceValue() public view returns (uint256) {
        return _value;
    }

    // TESTING PRICE
    function getCurrentPrice() public view returns (uint256) {
        return _value - _coupon * _couponsPaid;
    }

    function getCoupon() public view returns (uint256) {
        return _coupon;
    }

    function getMinCoupon() public view returns (uint256) {
        return _minCoupon;
    }

    function getMaxCoupon() public view returns (uint256) {
        return _maxCoupon;
    }

    function getTotalDebt() public view returns (uint256) {
        return _totalDebt;
    }

    function numberOfInvestors() public view returns (uint256) {
        return _initialInvestors.length;
    }

    function bondCount() public view returns (uint256) {
        return _bondIdTracker.current();
    }

    function getName() public view returns (string memory) {
        return name();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseBondURI;
    }

    function getInvestedAmountPerInvestor(address investor)
        external
        view
        returns (uint256)
    {
        return _investedAmountPerInvestor[investor];
    }

    // Needed to override this function as two parent classes defined the same function
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Function for investors to register their bids
    function registerBid(uint256 coupon, uint256 numberOfBonds)
        external
        payable
        onlyWhileBiddingWindowOpen
    {
        require(
            coupon >= _minCoupon && coupon <= _maxCoupon,
            "Coupon needs to be between the set range"
        );
        require(
            msg.value >= _value * numberOfBonds,
            "Not enough coins deposited for the bid"
        );
        require(
            _biddedInvestors[msg.sender] == false,
            "Only one bid per investor"
        );

        _biddedInvestors[msg.sender] = true;
        _requestedBondsPerInvestor[msg.sender] = numberOfBonds;

        // Update the demand for the coupon level
        uint256 currentDemand = _bidsPerCoupon[coupon];
        _bidsPerCoupon[coupon] = currentDemand + numberOfBonds;

        // Add the investor to the list if not already on the list
        uint256 currentAmountInvested = _bidsPerInvestorAtCouponLevel[
            msg.sender
        ][coupon];
        if (currentAmountInvested == 0) {
            _investorListAtCouponLevel[coupon].push(msg.sender);
        }

        // Update the mapping
        _bidsPerInvestorAtCouponLevel[msg.sender][coupon] =
            numberOfBonds +
            currentAmountInvested;

        _investedAmountPerInvestor[msg.sender] = _value * numberOfBonds;

        // Emit event
        emit Bid(msg.sender, coupon, numberOfBonds);

        // Refund if overpaid
        if (msg.value > _value * numberOfBonds) {
            uint256 extraAmount = msg.value - _value * numberOfBonds;
            payable(msg.sender).transfer(extraAmount);
            emit CoinRefund(msg.sender, extraAmount);
        }
    }

    // Function for issuer to define coupon
    // Finds the lowest coupon that fullfills the demand
    // Returns the defined coupon
    function defineCoupon()
        public
        onlyWhileBiddingWindowClosed
        onlyOwner
        returns (uint256)
    {
        // Variable for the total demand for tokens
        uint256 tokenDemand = 0;

        // Iterate each coupon level, and count the token demand to
        // determine the coupon level which will fulfills the seeked number of bonds
        for (uint256 i = _minCoupon; i <= _maxCoupon; i++) {
            // Increase the tokendemand
            tokenDemand += _bidsPerCoupon[i];
            // If enough interest at this coupon level, set coupon and break the loop
            if (tokenDemand >= _numberOfBondsSeeked) {
                _coupon = i;
                break;
            }
        }

        if (_coupon > 0) {
            emit CouponSet(_coupon);
            _coupondefined = true;
            setInvestroArray();
        } else {
            emit CancelBondIssue(tokenDemand, _numberOfBondsSeeked);
        }

        // Refund unsuccessful investors
        refundBiddersFromCouponLevel(_coupon + 1);

        return _coupon;
    }

    function setInvestroArray() internal {
        for (uint256 i = _minCoupon; i <= _coupon; i++) {
            address[] memory investors = getBiddersAtCoupon(i);
            for (uint256 j = 0; j < investors.length; j++) {
                _initialInvestors.push(investors[j]);
            }
        }
    }

    function getBiddersAtCoupon(uint256 coupon)
        public
        view
        returns (address[] memory)
    {
        require(
            coupon >= _minCoupon && coupon <= _maxCoupon,
            "Coupon not in range"
        );
        return _investorListAtCouponLevel[coupon];
    }

    // Function to refund unsuccessful bidders when coupon is defined
    function refundBiddersFromCouponLevel(uint256 coupon) internal {
        for (uint256 i = coupon; i <= _maxCoupon; i++) {
            address[] memory investors = getBiddersAtCoupon(i);
            for (uint256 j = 0; j < investors.length; j++) {
                address investor = investors[j];
                uint256 amount = _bidsPerInvestorAtCouponLevel[investor][i];
                payable(investor).transfer(_value * amount);
                emit CoinRefund(investor, amount * _value);
            }
        }
    }

    // Just for testing
    function getInvestorBalance(address investor)
        public
        view
        returns (uint256)
    {
        require(investor != address(0), "Balance query for the zero address");
        return _investedAmountPerInvestor[investor];
    }

    // Return true if the investment window is open, false otherwise.
    function biddingWindowisOpen() public view returns (bool) {
        return block.timestamp <= _bidClosingTime;
    }

    /**
     * @dev Function to issue bonds for investors who have registered 
        Assumes all investors will get the requested investment
        Can be called only when investment window is closed and the contract is unpaused
     */

    function issueBonds()
        public
        onlyWhileBiddingWindowClosed
        onlyOwner
    {
        require(
            _coupondefined == true,
            "can not issue bonds if the coupon has not been defined"
        );

        uint256 bondsAvailable = _numberOfBondsSeeked;

        // Go through the investors
        for (uint256 i = 0; i < _initialInvestors.length; i++) {
            address investor = _initialInvestors[i];
            uint256 numberOfBonds = _requestedBondsPerInvestor[investor];

            // If the demanded amount is more than bonds available
            if (numberOfBonds > bondsAvailable) {
                // Transfer the value to company
                _company.transfer(_value * bondsAvailable);
                _totalDebt += _value * bondsAvailable;

                for (uint256 j = 0; j < bondsAvailable; j++) {
                    _mint(investor, _bondIdTracker.current());
                    _bondIdTracker.increment();
                }

                // Refund extra amount
                uint256 balance = _investedAmountPerInvestor[investor];
                _investedAmountPerInvestor[investor] =
                    balance -
                    _value *
                    bondsAvailable;
                uint256 refund = _investedAmountPerInvestor[investor];
                payable(investor).transfer(refund);
                emit CoinRefund(investor, refund);

                // Set bonds available to 0
                bondsAvailable = 0;

                // Else, fulfill the whole demans
            } else {
                _company.transfer(_value * numberOfBonds);
                _totalDebt += _value * numberOfBonds;
                for (uint256 j = 0; j < numberOfBonds; j++) {
                    _mint(investor, _bondIdTracker.current());
                    _bondIdTracker.increment();
                }
                // Update Investor balance to 0
                _investedAmountPerInvestor[investor] = 0;

                bondsAvailable -= numberOfBonds;
            }
        }
    }

    // Function for the borrowing company to pay coupons
    function payCoupons() public payable {
        // Message needs to have enough value for the copupon payments
        require(
            msg.sender == _company,
            "Coupon payment should come from the borrowing company"
        );
        require(
            msg.value >= _coupon * _bondIdTracker.current(),
            "Not enough coins for coupons"
        );

        // Prevents company from paying extra coupons
        require(
            _couponsPaid < _totalCouponPayments,
            "All coupon payments have already been made"
        );

        for (uint256 i = 0; i < _bondIdTracker.current(); i++) {
            address payable investor = payable(ownerOf(i));
            investor.transfer(_coupon);
            emit CouponPayment(investor, i);
        }

        // Update coupon payment date
        _actualCouponPaymentDates[_couponsPaid] = block.timestamp;
        _couponsPaid++;

        // Refund extra coins if paid too much
        if (msg.value > _coupon * _bondIdTracker.current()) {
            uint256 extraAmount = msg.value -
                _coupon *
                _bondIdTracker.current();
            payable(msg.sender).transfer(extraAmount);
            emit CoinRefund(msg.sender, extraAmount);
        }
    }

    function couponPaymentMadeOnTime(uint256 coupon)
        public
        view
        returns (bool)
    {
        require(
            coupon >= 1 && coupon <= _totalCouponPayments,
            "That coupon does not exists"
        );
        require(
            block.timestamp > _couponPaymentDates[coupon - 1],
            "Coupon not due yet"
        );

        if (_actualCouponPaymentDates[coupon - 1] == 0) {
            return false;
        }
        // Coupon payment made before or by the agreed data
        else if (
            _actualCouponPaymentDates[coupon - 1] <=
            _couponPaymentDates[coupon - 1]
        ) {
            return true;
        } else {
            return false;
        }
    }

    // This function should be called by the borrowing company
    function payBackBond() public payable {
        require(
            msg.sender == _company,
            "Paying company should be the borrowing company"
        );
        require(
            msg.value >= _totalDebt,
            "Not enough coins to settle the bond at maturity"
        );

        // Interate through the bonds
        uint256 numberOfBonds = _bondIdTracker.current();
        for (uint256 i = 0; i < numberOfBonds; i++) {
            address payable investor = payable(ownerOf(i));
            // Transfer bond from investor to owner
            bondTransfer(investor, _owner, i);
            // Return funds
            investor.transfer(_value);
            // Decrement the values
            _totalDebt = _totalDebt - _value;
            _bondIdTracker.decrement();
        }

        // Set the payment date
        _actualPrincipalPaymentDate = block.timestamp;

        // Refund coins there is extra money on the contract
        if (address(this).balance > 0 && msg.value > _totalDebt) {
            uint256 extraAmount = msg.value - _totalDebt;
            if (address(this).balance < extraAmount) {
                uint256 amount = address(this).balance;
                payable(msg.sender).transfer(amount);
                emit CoinRefund(msg.sender, amount);
            } else {
                payable(msg.sender).transfer(extraAmount);
                emit CoinRefund(msg.sender, extraAmount);
            }
        }
    }

    // Checks if the principal amount was paid back on time
    function principalPaymentMadeOnTime() public view returns (bool) {
        require(block.timestamp > _maturityDate, "Bond has not matured yet");
        if (_actualPrincipalPaymentDate == 0) {
            return false;
        } else if (_actualPrincipalPaymentDate > _maturityDate) {
            return false;
        } else {
            return true;
        }
    }

    // Internal function to transer the bonds
    function bondTransfer(
        address from,
        address to,
        uint256 bondId
    ) internal {
        _transfer(from, to, bondId);
    }

    /**
     * Function to adjust the coupon
     */
    function adjustCoupon(bool increase, uint256 amount) external onlyOwner {
        if (increase) {
            _coupon = _coupon + amount;
        } else {
            require(amount <= _coupon, "Coupon payment can't be negative");
            _coupon = _coupon - amount;
        }
        emit CouponAdjustment(msg.sender, _coupon);
    }
}
