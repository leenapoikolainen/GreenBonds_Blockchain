// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract GreenCertificate {
    // Owner
    address public _owner;

    // function modifier
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    // Company address
    address private _company;

    // Mapping for certified projects
    mapping(string => bool) _greenProjects;

    constructor(address company) {
        _company = company;
        _owner = msg.sender;
    }

    function addProject(string memory name) external onlyOwner {
        _greenProjects[name] = true;

    }

    function getCompany() public view returns (address){
        return _company;
    }

    function isCertifiedProject(string memory name) public view returns (bool) {
        return (_greenProjects[name]);
    }

}