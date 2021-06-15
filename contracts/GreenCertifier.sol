// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenCertificate.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreenCertifier {
    using Address for address;

    // Event to be emmitted when a company certificate is created
    event CompanyCertification(GreenCertificate certificate);

    // Event to be emmitted when a project is added
    event ProjectCertification(address company, string project);


    // Owner of this contract
    address public _owner;


    // function modifier
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    // Maps company address to a green certificate
    mapping(address => GreenCertificate) public _greenCertificates;
    mapping(address => bool) public _certifiedCompanies;
    // Two options for mapping
    //mapping (uint256 => GreenCertificate) private _greenCertificates;
    //mapping (uint256 => address) private _greenCertificates;

    constructor() {
        _owner = msg.sender;
    }

    function createCertificate(address company, string memory project) external onlyOwner {
        // Create certificate for the company if it already does not exist
        if(_certifiedCompanies[company] == false) {
            // Create certificate
            GreenCertificate newCertificate = new GreenCertificate(company);
            _certifiedCompanies[company] = true;
            _greenCertificates[company] = newCertificate;

            // Create an event
            emit CompanyCertification(newCertificate);
        } 

        // Add project to the list
        GreenCertificate certificate = _greenCertificates[company];
        certificate.addProject(project);   
        emit ProjectCertification(company, project);      
    }

    function isCertified(address company, string memory project) public view returns(bool) {
        require(_certifiedCompanies[company], "Company is not certified");
        GreenCertificate certificate = _greenCertificates[company];
        return certificate.isCertifiedProject(project);
    }
}

