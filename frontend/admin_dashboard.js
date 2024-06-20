document.addEventListener('DOMContentLoaded', async () => {
    const generateButton = document.getElementById('generateTicket');
    const saveButton = document.getElementById('saveQrCode');

    if (!generateButton || !saveButton) {
        console.error('Required elements not found in the DOM.');
        return;
    }

    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        console.error('MetaMask is not installed. Please install MetaMask and try again.');
        return;
    }

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Web3 initialized and MetaMask connected');
        } catch (error) {
            console.error('User denied account access', error);
            return;
        }
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 initialized with current provider');
    } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
        return;
    }

    // Fetch the contract address from the JSON file
    let contractAddress;
    try {
        const response = await fetch('contractAddress.json');
        const data = await response.json();
        contractAddress = data.address;
        console.log('Contract address:', contractAddress);
    } catch (error) {
        console.error('Error fetching contract address:', error);
        return;
    }

    const contractABI = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "ticketId",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "issuer",
                    "type": "address"
                }
            ],
            "name": "TicketIssued",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "ticketId",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "isValid",
                    "type": "bool"
                }
            ],
            "name": "TicketVerified",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "tickets",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "passengerName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "passengerNID",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "travelDate",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "departure",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "arrival",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "issuer",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_passengerName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_passengerNID",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_travelDate",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_departure",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_arrival",
                    "type": "string"
                }
            ],
            "name": "issueTicket",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "_ticketId",
                    "type": "bytes32"
                }
            ],
            "name": "verifyTicket",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    let contract;
    try {
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log('Contract initialized', contract);
    } catch (error) {
        console.error('Error initializing contract:', error);
    }

    let generatedTicketId = null;

    generateButton.addEventListener('click', async () => {
        const passengerName = document.getElementById('passengerName').value;
        const passengerNID = document.getElementById('passengerNID').value;
        const travelDate = document.getElementById('travelDate').value;
        const departure = document.getElementById('departure').value;
        const arrival = document.getElementById('arrival').value;

        if (!passengerName || !passengerNID || !travelDate || !departure || !arrival) {
            alert('Please fill in all fields.');
            return;
        }

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log('Account:', account);

        try {
            const gasEstimate = await contract.methods.issueTicket(passengerName, passengerNID, travelDate, departure, arrival).estimateGas({ from: account });
            console.log('Gas estimate:', gasEstimate);

            const result = await contract.methods.issueTicket(passengerName, passengerNID, travelDate, departure, arrival).send({ from: account, gas: gasEstimate });
            console.log('Transaction result:', result);

            const ticketId = result.events.TicketIssued.returnValues.ticketId;
            console.log('Issued Ticket ID:', ticketId);

            document.getElementById('blockchainAddress').textContent = ticketId;

            // Store the generated ticket ID
            generatedTicketId = ticketId;

            // Generate QR code
            const qrCodeCanvas = document.getElementById('qrCode');
            QRCode.toCanvas(qrCodeCanvas, ticketId, function (error) {
                if (error) console.error(error);
                console.log('QR code generated!');
            });

        } catch (error) {
            console.error('Error generating ticket:', error);
        }
    });

    saveButton.addEventListener('click', () => {
        if (generatedTicketId) {
            const qrCodeCanvas = document.getElementById('qrCode');
            const link = document.createElement('a');
            link.href = qrCodeCanvas.toDataURL();
            link.download = `ticket_${generatedTicketId}.png`;
            link.click();
        } else {
            alert('Please generate a ticket first.');
        }
    });
});
