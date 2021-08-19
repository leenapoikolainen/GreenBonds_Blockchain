// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenBond2 is ERC721, Ownable {
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
    
    // Bond ID numbers
    Counters.Counter private _bondIdTracker;

    // URI for bond metadata stored on decentralised database or cloud
    string private _baseBondURI;

    // Bond state controllers
    bool private _coupondefined = false;
    bool private _cancelled = false;
    bool private _issued = false;

    // List of initial investors
    address[] private _initialInvestors; 

    // Owner of the contract - Issuing Financial Institution
    address private _owner;
    // Borrowing company
    address payable private _company;

    // Face value of 1 bond
    uint256 private _value;

    // Number of bonds sought by the borrowing company
    uint256 private _numberOfBondsSought;

    // Total amount borrowed. Calculated as number of bonds * face value
    uint256 private _totalDebt;

    // Coupon range
    uint256 private _minCoupon;
    uint256 private _maxCoupon;

    // Final coupon 
    uint256 private _coupon;
    
    // Term of the bond (in years)
    uint256 private _term;

    // Coupon payment schedule (per year)
    uint256 private _couponsPerYear;

    // Total number of coupons. Calculated as term * number of coupons per year
    uint256 private _totalCouponPayments;

    // Number of coupons paid
    uint256 private _couponsPaid; // Zero in the beginning

    // Closing time for bidding
    uint256 private _bidClosingTime;    

    // Issue Date: bid closing time + 2 days
    uint256 private _issueDate;

    // Maturity Date: issue date + term
    uint256 private _maturityDate;

    // Actual principal payment date
    uint256 private _actualPrincipalPaymentDate; 

    // Coupon payment dates: calculated from issue date onwards
    uint256[] private _couponPaymentDates;

    // Actual coupon payment dates
    uint256[] private _actualCouponPaymentDates;

    // Records for investor bid details
    mapping(address => uint256) private _stakedAmountPerInvestor;
    mapping(address => uint256) private _requestedBondsPerInvestor;
    mapping(address => uint256) private _couponPerInvestor;
    mapping(address => bool) private _investorHasBid;

    // Records for coupon definition
    mapping(uint256 => uint256) private _bidsPerCoupon;
    mapping(uint256 => address[]) private _investorListAtCouponLevel;

    // EVENTS

    /**
     * @dev Emitted when an investor registers a bid
     */
    event Bid(address bidder, uint256 coupon, uint256 numberOfBonds);
    
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
     * @dev Emmitted when the coupon is defined after bidding. 
            Only when there is enough demand and issue will go ahead.
     */
    event CouponSet(uint256 coupon);

    /**
     * @dev Emmitted when there is not enough demand for the bond
            and the issue is cancelled.
     */
    event CancelBondIssue(uint256 actualDemand, uint256 requestedDemand);
    
    
    /**
     * @dev Emmitted when coupon payment is adjusted
     */
    event CouponAdjustment(uint256 from, uint256 to);
    

    /**
     * @dev constructor: requires specifying the borrowing company address,
            bond name and symbol, number of bonds sought, coupon range,
            bidding window closing time, term, coupons per year and
            base URI for metadata,
     */
    constructor(
        address company,
        string memory name,
        string memory symbol,
        uint256 numberOfBondsSought,
        uint256 minCoupon,
        uint256 maxCoupon,
        uint256 bidClosingTime,
        uint256 term,
        uint256 couponsPerYear,
        string memory baseBondURI
    ) ERC721(name, symbol) {
        require(company != address(0), "Company address can not be 0x0");
        require(
            maxCoupon > minCoupon,
            "max coupon needs to be greater than min coupon"
        );
        require(
            bidClosingTime > block.timestamp,
            "Closing time can't be in the past"
        );
        _owner = msg.sender;
        _company = payable(company);
        _numberOfBondsSought = numberOfBondsSought;
        _minCoupon = minCoupon;
        _maxCoupon = maxCoupon;
        _coupon = 0; // by default 0
        _value = 100; // Face value default at 100
        _couponsPaid = 0; // set to 0 
        _bidClosingTime = bidClosingTime;
        _baseBondURI = baseBondURI;
        
        _issueDate = _bidClosingTime + 1 weeks;
        _term = term;
        _couponsPerYear = couponsPerYear;
        _totalCouponPayments = couponsPerYear * term;
        _maturityDate = _issueDate + term * 365 days;
        _actualPrincipalPaymentDate = 0; // default to 0
        uint256 timeBetweenpayments = 365 days / couponsPerYear;

        // Setting up the coupon payment dates
        for (uint256 i = 1; i <= _totalCouponPayments; i++) {
            _couponPaymentDates.push(_issueDate + timeBetweenpayments * i);
            _actualCouponPaymentDates.push(0);
        }
    }

    /**
     * @dev Get borrowing company.
     */
    function getCompany() public view returns (address) {
        return _company;
    }

    /**
     * @dev Get bond face value
     */
    function getFaceValue() public view returns (uint256) {
        return _value;
    }

    /**
     * @dev Get coupon bidding range
     */
    function getMinCoupon() public view returns (uint256) {
        return _minCoupon;
    }

    function getMaxCoupon() public view returns (uint256) {
        return _maxCoupon;
    }

    /**
     * @dev Get coupon
     */
    function getCoupon() public view returns (uint256) {
        return _coupon;
    }
 

    /**
     * @dev Get number of bonds sought
     */
    function getNumberOfBondsSought() public view returns (uint256) {
        return _numberOfBondsSought;
    }

    /**
     * @dev Get bond term in years
     */
    function getTerm() public view returns (uint256) {
        return _term;
    }

    /**
     * @dev Get the total debt
     */
    function getTotalDebt() public view returns (uint256) {
        return _totalDebt;
    }

    /**
     * @dev Get bid closing time
     */
    function getBidClosingTime() external view returns (uint256) {
        return _bidClosingTime;
    }

    /**
     * @dev Get issue date
     */
    function getIssueDate() public view returns (uint256) {
        return _issueDate;
    }

    /**
     * @dev Get maturity date
     */
    function getMaturityDate() public view returns (uint256) {
        return _maturityDate;
    }

    /**
     * @dev Query bond status (cancelled/coupon defined)
     */
    function couponDefined() public view returns (bool) {
        return _coupondefined;
    }

    function cancelled() public view returns (bool) {
        return _cancelled;
    }

    function issued() public view returns (bool) {
        return _issued;
    }

    /**
     * @dev Get the number of coupon payments for the bond
     */
    function getNumberOfCoupons() public view returns (uint256) {
        return _totalCouponPayments;
    }

    /**
     * @dev Get the number of coupons paid
     */
    function getNumberOfCouponsPaid() public view returns (uint256) {
        return _couponsPaid;
    }

    /**
     * @dev Get the agreed date for a specific coupon
     */
    function getCouponDate(uint256 number) public view returns (uint256) {
        require(
            number > 0 && number <= _totalCouponPayments,
            "No such coupon payment, check the number of coupon payments"
        );
        return _couponPaymentDates[number - 1];
    }

    /**
     * @dev Get the actual coupon payment date for a specific coupon
     */
    function getActualCouponDate(uint256 number) public view returns (uint256) {
        require(
            number > 0 && number <= _totalCouponPayments,
            "No such coupon payment, check the number of coupon payments"
        );
        return _actualCouponPaymentDates[number - 1];
    }

    /**
     * @dev Get an array containin all agreed coupon dates
     */
    function getCouponDates() public view returns (uint256[] memory) {
        return _couponPaymentDates;
    }

    /**
     * @dev Get actual principal payment date
     */
    function getActualPricipalPaymentDate() public view returns (uint256) {
        return _actualPrincipalPaymentDate;
    }

    /*
    function numberOfInvestors() public view returns (uint256) {
        return _initialInvestors.length;
    }
    */

    /**
     * @dev Get the number of bonds issued
     */
    function bondCount() public view returns (uint256) {
        return _bondIdTracker.current();
    }

    /**
     * @dev Get the base URI for bond metadata
     */
    function getBaseURI() external view returns (string memory) {
        return _baseBondURI;
    }


    /**
     * @dev Get staked amount per investor
     */
    function getStakedAmountPerInvestor(address investor)
        external
        view
        returns (uint256)
    {
        return _stakedAmountPerInvestor[investor];
    }

    /**
     * @dev Get requested bonds per investor
     */
    function getRequestedBondsPerInvestor(address investor)
        external
        view
        returns(uint256)
    {
        return _requestedBondsPerInvestor[investor];
    }

    /**
     * @dev Get the coupon bid per investor
     */
    function getCouponPerInvestor(address investor)
        external
        view
        returns(uint256)
    {
        return _couponPerInvestor[investor];
    }

    /**
     * @dev Get a list of bidders at a specific coupon level
     */
    function getBiddersAtCoupon(uint256 coupon)
        internal
        view
        returns (address[] memory)
    {
        require(
            coupon >= _minCoupon && coupon <= _maxCoupon,
            "Coupon not in range"
        );
        return _investorListAtCouponLevel[coupon];
    }  

    /**
     * @dev Returns true if bidding window is open
     */
    function biddingWindowisOpen() public view returns (bool) {
        return block.timestamp <= _bidClosingTime;
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

    /**
     * @dev Function for an investor to register a bid.
            Needs to specify the coupon within the given range (min and max coupon)
            and send enough ether to cover the bid (number of bonds bid * face value of bond).
            Only one bid allowed per investor.    
     */
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
            "Not enough ether to cover the bid"
        );
        require(
            _investorHasBid[msg.sender] == false,
            "Only one bid per investor"
        );

        // Mark that investor has made a bit
        _investorHasBid[msg.sender] = true;
        // Update bid details
        _requestedBondsPerInvestor[msg.sender] = numberOfBonds;
        _couponPerInvestor[msg.sender] = coupon;

        // Update the demand for the coupon level
        uint256 currentDemand = _bidsPerCoupon[coupon];
        _bidsPerCoupon[coupon] = currentDemand + numberOfBonds;
        
        // Add the investor to the list of investors bidding at this coupon level
        _investorListAtCouponLevel[coupon].push(msg.sender);
        
        // Update the staked amount for the investor
        _stakedAmountPerInvestor[msg.sender] = _value * numberOfBonds;

        // Emit event
        emit Bid(msg.sender, coupon, numberOfBonds);

        // Refund if overpaid
        if (msg.value > _value * numberOfBonds) {
            uint256 extraAmount = msg.value - _value * numberOfBonds;
            payable(msg.sender).transfer(extraAmount);
            emit CoinRefund(msg.sender, extraAmount);
        }
    }

    /**
     * @dev Function for the issuing institution to define the coupon.
            Finds the lowest coupon that covers the number of sought bonds
            and sets the coupon to that level. Refunds unsuccessful bidders.
            If not enough demand, coupon will not be defined and _cancelled
            will be set to false.    
     */
    function defineCoupon()
        public
        onlyWhileBiddingWindowClosed
        onlyOwner
    {
        require(_coupondefined == false, "Can't define coupon more than once");

        // Variable for the total demand for bonds
        uint256 bondDemand = 0;

        // Iterate each coupon level, and count the bonf demand to
        // determine the coupon level which will fulfills the seeked number of bonds
        for (uint256 i = _minCoupon; i <= _maxCoupon; i++) {
            // Increase the tokendemand
            bondDemand += _bidsPerCoupon[i];
            // If enough interest at this coupon level, set coupon and break the loop
            if (bondDemand >= _numberOfBondsSought) {
                _coupon = i;
                _coupondefined = true;
                break;
            }
        }
        // If there was enough demand, emits Coupon set event and
        // sets investor array for token issue
        if (_coupondefined) {
            emit CouponSet(_coupon);
            setInvestorArray();
        // Else bond issue is cancelled
        } else {
            emit CancelBondIssue(bondDemand, _numberOfBondsSought);
            _cancelled = true;
        }

        // Refund unsuccessful investors
        refundBiddersFromCouponLevel(_coupon + 1);
    }

    /**
     * @dev Internal function to set the investor array for token issue.
            Array will include all the investors who bid either at the 
            set coupon rate or lower
     */
    function setInvestorArray() internal {
        for (uint256 i = _minCoupon; i <= _coupon; i++) {
            address[] memory investors = getBiddersAtCoupon(i);
            for (uint256 j = 0; j < investors.length; j++) {
                _initialInvestors.push(investors[j]);
            }
        }
    }

    /**
     * @dev Internal function to refund investors, who bid at specified
            coupon level or above
     */
    function refundBiddersFromCouponLevel(uint256 coupon) internal {
        uint256 min;
        if (coupon < _minCoupon) {
            min = _minCoupon;
        } else {
            min = coupon;
        }
        
        for (uint256 i = min; i <= _maxCoupon; i++) {
            address[] memory investors = getBiddersAtCoupon(i);
            for (uint256 j = 0; j < investors.length; j++) {
                address investor = investors[j];
                uint256 amount = _requestedBondsPerInvestor[investor];
                payable(investor).transfer(_value * amount);
                emit CoinRefund(investor, amount * _value);
            }
        }
    }


    /**
     * @dev Function to issue bonds for investors who bid successfully.
        Can be called only if coupon has been defined (i.e., issue has not been cancelled).
        Only owner, the issuing institution, can call the function
     */
    function issueBonds()
        public
        onlyOwner
    {
        require(
            _coupondefined == true,
            "can not issue bonds if the coupon has not been defined"
        );

        require(_issued == false, "Can only issue bonds once");

        uint256 bondsAvailable = _numberOfBondsSought;

        // Go through the investors
        for (uint256 i = 0; i < _initialInvestors.length; i++) {
            address investor = _initialInvestors[i];
            uint256 numberOfBonds = _requestedBondsPerInvestor[investor];

            // If the demanded amount is more than bonds available
            // Issue only number of bonds available
            if (numberOfBonds > bondsAvailable) {
                // Transfer the value to company
                _company.transfer(_value * bondsAvailable);
                _totalDebt += _value * bondsAvailable;
                _stakedAmountPerInvestor[investor] -= _value * bondsAvailable;

                // Mint the tokens
                for (uint256 j = 0; j < bondsAvailable; j++) {
                    _mint(investor, _bondIdTracker.current());
                    _bondIdTracker.increment();
                }

                // Refund extra amount
                uint256 refund = _stakedAmountPerInvestor[investor]; 
                payable(investor).transfer(refund);
                emit CoinRefund(investor, refund);
                _stakedAmountPerInvestor[investor] -= refund;

                // Set bonds available to 0
                bondsAvailable = 0;

                // Else, fulfill the whole demans
            } else {
                // Transfer the value to the company
                _company.transfer(_value * numberOfBonds);
                _totalDebt += _value * numberOfBonds;
                _stakedAmountPerInvestor[investor] -= _value * numberOfBonds;

                // Mint tokens
                for (uint256 j = 0; j < numberOfBonds; j++) {
                    _mint(investor, _bondIdTracker.current());
                    _bondIdTracker.increment();
                }
                // Update the bonds available
                bondsAvailable -= numberOfBonds;
            }            
        }
        _issued = true;
    }

    /**
     * @dev Function to make a coupon payment.
            Can be called only by the borrowing company.
            Requires sending enough ether to cover a coupon payment
            (total number of bonds * coupon rate)
     */
    function makeCouponPayment() public payable {
        require(
            msg.sender == _company,
            "Coupon payment should come from the borrowing company"
        );
        require(
            msg.value >= _coupon * _bondIdTracker.current(),
            "Not enough ether to cover the coupon payment"
        );

        for (uint256 i = 0; i < _bondIdTracker.current(); i++) {
            address payable investor = payable(ownerOf(i));
            investor.transfer(_coupon);
            emit CouponPayment(investor, i);
        }

        // Update the actual coupon payment date for the record
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

    /**
     * @dev Function to check if a coupon payment was made on time
     */
    function couponPaymentOnTime(uint256 coupon) public view returns (string memory) {
        if(coupon < 1 || coupon > _totalCouponPayments) {
            return "That coupon does not exists.";
        }
        // Query before the due date
        if (block.timestamp < _couponPaymentDates[coupon - 1]) {
            if(_actualCouponPaymentDates[coupon - 1] != 0) {
                return "Coupon has been paid early prior to due date.";
            }
            else {
                return "Coupon not due yet.";
            }
        }
        // Query after the due date
        else {
            if(_actualCouponPaymentDates[coupon - 1] == 0) {
                return "Coupon payment is late.";
            }
            else if(_actualCouponPaymentDates[coupon - 1] <= _couponPaymentDates[coupon - 1]) {
                return "Coupon paid on time.";
            }
            
            else {
                return "Coupon paid late.";
            }
        }
    }
   

    /**
     * @dev Function to make a principal payment at the maturity
            Can be called only by the borrowing company.
            Requires sending enough ether to cover the full principal
            (facevalue * numer of bonds)
            Transfers the bond tokens back to the issuing company
     */
    function payBackBond() public payable {
        require(
            msg.sender == _company,
            "Paying company should be the borrowing company"
        );
        require(
            msg.value >= _totalDebt,
            "Not enough ether to settle the bond at maturity"
        );

        // Interate through the bonds
        uint256 numberOfBonds = _bondIdTracker.current();
        for (uint256 i = 0; i < numberOfBonds; i++) {
            address payable investor = payable(ownerOf(i));
            // Transfer bond token from investor to owner
            _transfer(investor, _owner, i);
            // Return funds
            investor.transfer(_value);
            // Decrement the values
            _totalDebt = _totalDebt - _value;
            _bondIdTracker.decrement();
        }

        // Set the payment date
        _actualPrincipalPaymentDate = block.timestamp;

        // Refund any extra ether on the contract
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
  
    /**
     * @dev Function to check if the principal payment was made on time
     */
    function principalPaidOnTime() public view returns (string memory) {
        // Querying before the maturity date
        if(block.timestamp < _maturityDate) {
            if (_actualPrincipalPaymentDate == 0) {
                return "Principal Payment is not due yet.";
            } else {
                return "Principal was paid back early.";
            }
        }
        // Querying after the maturity date
        else {
            if(_actualPrincipalPaymentDate == 0) {
                return "Principal payment is late.";
            }
            else if(_actualPrincipalPaymentDate <= _maturityDate) {
                return "Principal was paid back on time.";
            }
            else {
                return "Principal was paid back late.";
            }
        }
    }
  
    /**
     * @dev Function to adjust the coupon
            Can be only called by the owner (issuing institution)
            Need to specify the direction of the adjustment and the amount   
     */
    function adjustCoupon(bool increase, uint256 amount) external onlyOwner {
        require(_issued == true, "Coupon can not be adjusted before the coupon has been issued");
        uint256 previousCoupon = _coupon;
        if (increase) {
            _coupon = _coupon + amount;
        } else {
            // If adjustement would lead to negative coupon, set coupon to 0
            if (amount > _coupon) {
                _coupon = 0;
            } else {
                _coupon = _coupon - amount;
            }       
        }
        emit CouponAdjustment(previousCoupon, _coupon);
    }
}
