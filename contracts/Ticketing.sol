pragma solidity ^0.8.0;

contract Ticketing {
    struct Ticket {
        string passengerName;
        string passengerNID;
        string travelDate;
        string departure;
        string arrival;
        address issuer;
    }

    mapping(bytes32 => Ticket) public tickets;

    event TicketIssued(bytes32 ticketId, address issuer);
    event TicketVerified(bytes32 ticketId, bool isValid);

    function issueTicket(
        string memory _passengerName,
        string memory _passengerNID,
        string memory _travelDate,
        string memory _departure,
        string memory _arrival
    ) public returns (bytes32) {
        bytes32 ticketId = keccak256(abi.encodePacked(_passengerName, _passengerNID, _travelDate, _departure, _arrival, msg.sender));
        tickets[ticketId] = Ticket(_passengerName, _passengerNID, _travelDate, _departure, _arrival, msg.sender);
        emit TicketIssued(ticketId, msg.sender);
        return ticketId;
    }

    function verifyTicket(bytes32 _ticketId) public returns (bool) {
        bool isValid = tickets[_ticketId].issuer != address(0);
        emit TicketVerified(_ticketId, isValid);
        return isValid;
    }
}
