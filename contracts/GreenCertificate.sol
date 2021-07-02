// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract GreenCertificate {

    event ProjectAdded(string name, uint256 timestamp);
    event ProjectRemoved(string name);

    // Owner
    address public _owner;

    // function modifier
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    // Company address
    address public _company;
    uint256 private _endDate;

    // Mapping for certified projects
    mapping(string => bool) _greenProjects;

    constructor(address company) {
        _company = company;
        _owner = msg.sender;
    }

    function setDeadline(uint256 time) external onlyOwner {
        require(time >= block.timestamp, "Deadline time is before current time");
        _endDate = time;
    }

    function getEndDate() public view returns (uint256) {
        return _endDate;
    }

    function addProject(string memory name) external onlyOwner {
        _greenProjects[name] = true;
        emit ProjectAdded(name, block.timestamp);
    }

    function removeProject(string memory name) external onlyOwner {
        _greenProjects[name] = false;
        emit ProjectRemoved(name);
    }

    function getCompany() public view returns (address){
        return _company;
    }

    function isCertifiedProject(string memory name) public view returns (bool) {
        return (_greenProjects[name]);
    }

}