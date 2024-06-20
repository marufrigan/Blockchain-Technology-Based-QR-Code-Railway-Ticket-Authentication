document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else {
        console.warn('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    const contractAddress = '0x57CD77f389b52AE6A665D28D2D3D659de1Ec269b'; // Deployed contract address
    const contractABI = [
        // Paste the ABI array here
    ];
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    document.getElementById('generateTicket').addEventListener('click', async () => {
        const passengerId = document.getElementById('passengerId').value;
        const travelDate = document.getElementById('travelDate').value;
        const departure = document.getElementById('departure').value;
        const arrival = document.getElementById('arrival').value;

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        try {
            const result = await contract.methods.issueTicket(passengerId, travelDate, departure, arrival).send({ from: account });
            const ticketId = result.events.TicketIssued.returnValues.ticketId;
            document.getElementById('blockchainAddress').textContent = ticketId;
            generateQRCode(ticketId);
        } catch (error) {
            console.error(error);
        }
    });

    function generateQRCode(ticketId) {
        const qrCodeCanvas = document.getElementById('qrCode');
        QRCode.toCanvas(qrCodeCanvas, ticketId, function (error) {
            if (error) console.error(error);
            console.log('QR code generated!');
        });
    }
});
