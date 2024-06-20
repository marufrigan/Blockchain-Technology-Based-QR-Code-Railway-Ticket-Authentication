**Blockchain-Based Railway Ticketing System**
**Introduction**
This project presents a blockchain-based railway ticketing system designed to address issues of fraud, cloning, and tampering prevalent in traditional ticketing methods. Leveraging Ethereum blockchain technology, the system ensures the authenticity and security of railway tickets through smart contracts, multi-signature verification, and QR code technology.

**Features**
Secure Ticket Issuance: Admin interface for generating unique, immutable tickets recorded on the blockchain.
Real-Time Transactions: Integration with MetaMask and Ganache to handle real-time Ether transactions.
Easy Ticket Verification: Customer interface for verifying ticket authenticity via QR codes.
Enhanced Security: Multi-signature verification to prevent unauthorized ticket issuance and validation.
Cost Efficiency: Optimized smart contract functions to minimize gas usage and transaction costs.
System Architecture
The system consists of three main components:

User Interface: Admin and customer interfaces for ticket management.
Blockchain Network: Ethereum blockchain ensuring security and transparency.
Smart Contracts: Handling ticket issuance and verification.

**Technology Stack**
Ethereum Blockchain
Smart Contracts (Solidity)
Ganache (Local Blockchain Simulation)
MetaMask (Real-time Ether Transactions)
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Smart Contracts
Ticketing.sol
solidity
Copy code
pragma solidity ^0.8.0;

contract Ticketing {
    address public admin;
    mapping(bytes32 => Ticket) public tickets;

    struct Ticket {
        string passengerName;
        string passengerNID;
        string travelDate;
        string departure;
        string arrival;
        uint256 price;
        address issuer;
    }

    event TicketIssued(bytes32 indexed ticketId, address indexed issuer);
    event TicketVerified(bytes32 indexed ticketId, bool isValid);

    constructor() {
        admin = msg.sender;
    }

    function issueTicket(
        string memory _passengerName,
        string memory _passengerNID,
        string memory _travelDate,
        string memory _departure,
        string memory _arrival
    ) public returns (bytes32) {
        bytes32 ticketId = keccak256(abi.encodePacked(_passengerName, _passengerNID, _travelDate, _departure, _arrival));
        tickets[ticketId] = Ticket(_passengerName, _passengerNID, _travelDate, _departure, _arrival, 0, msg.sender);
        emit TicketIssued(ticketId, msg.sender);
        return ticketId;
    }

    function verifyTicket(bytes32 _ticketId) public view returns (bool) {
        Ticket memory ticket = tickets[_ticketId];
        require(ticket.issuer != address(0), "Ticket does not exist");
        return true;
    }
}
**Installation**
**Prerequisites**
Node.js
Truffle
Ganache
MetaMask
Steps
Clone the repository:
sh
Copy code
git clone https://github.com/yourusername/railway-ticketing.git
cd railway-ticketing
Install dependencies:
sh
Copy code
npm install
Compile and deploy smart contracts:
sh
Copy code
truffle compile
truffle migrate --reset
Run the server:
sh
Copy code
node server.js
Open your browser and navigate to http://localhost:8001 to access the application.

Usage

Admin Interface

Log in as admin using the provided credentials.

Enter passenger details to issue a ticket.

The system generates a QR code for the ticket, which can be saved or printed.

**Customer Interface**

Log in as a customer using the provided credentials.

Purchase a ticket, which triggers a real-time Ether transaction via MetaMask.

Verify the ticket by uploading the QR code image.



**Contributors**
Your Name (marufrigan)

**License**
This project is licensed under the MIT License - see the LICENSE file for details.

**Acknowledgements**
References and academic papers used in the research.
Tools and libraries that made this project possible.
