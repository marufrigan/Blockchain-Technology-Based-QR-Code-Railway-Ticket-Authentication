document.addEventListener('DOMContentLoaded', async () => {
    const uploadButton = document.getElementById('uploadQrCode');
    const verifyButton = document.getElementById('verifyTicket');

    if (!uploadButton || !verifyButton) {
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

    verifyButton.addEventListener('click', async () => {
        const fileInput = document.getElementById('uploadQrCode');
        if (fileInput.files.length === 0) {
            alert('Please upload a QR code image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const qrCodeResult = jsQR(imageData.data, imageData.width, imageData.height);

                if (!qrCodeResult) {
                    console.error('QR code not found');
                    document.getElementById('verificationResult').textContent = 'Error verifying ticket: QR code not found';
                    return;
                }

                const ticketId = qrCodeResult.data;
                console.log('Ticket ID:', ticketId);

                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];
                console.log('Account:', account);

                try {
                    const gasEstimate = await contract.methods.verifyTicket(ticketId).estimateGas({ from: account });
                    console.log('Gas estimate:', gasEstimate);

                    const result = await contract.methods.verifyTicket(ticketId).send({ from: account, gas: gasEstimate });
                    console.log('Transaction result:', result);

                    const isValid = result.events.TicketVerified.returnValues.isValid;
                    console.log('Is Valid:', isValid);
                    if (isValid) {
                        document.getElementById('verificationResult').textContent = 'Your Ticket is Genuine and Have a Safe Journey';
                    } else {
                        document.getElementById('verificationResult').textContent = 'Your ticket is fake, please contact customer service';
                    }
                } catch (error) {
                    console.error('Error verifying ticket:', error);
                    document.getElementById('verificationResult').textContent = 'Error verifying ticket';
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    });
});
