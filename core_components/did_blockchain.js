<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR-DID Blockchain Interaction Demo</title>
    <style>
        body { font-family: 'Inter', sans-serif; padding: 20px; max-width: 800px; margin: auto; }
        h1 { color: #333; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 8px; overflow-x: auto; }
        button {
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 8px;
            border: none;
            background-color: #4A90E2;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s;
            margin-right: 10px;
        }
        button:hover:not(:disabled) {
            background-color: #357ABD;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .message-box {
            background-color: #e6f7ff;
            border: 1px solid #b3d9ff;
            padding: 15px;
            margin-top: 20px;
            border-radius: 8px;
        }
        .loading {
            background-color: #fff9e6;
            border-color: #ffe6b3;
            color: #d68b00;
        }
        .success {
            background-color: #e6ffed;
            border-color: #b7eb8f;
            color: #52c41a;
        }
        .gemini-output {
            background-color: #f7e6ff;
            border-color: #d9b3ff;
            color: #7b29a3;
        }
    </style>
</head>
<body>

<h1>QR-DID Conceptual Blockchain Demo</h1>
<p>
    This page demonstrates the conceptual process of registering a Decentralized Identifier (DID) and its associated
    Public Key on a blockchain. For this demo, we simulate the asynchronous blockchain transaction.
</p>
<button id="registerBtn" onclick="registerDID()">Register DID</button>
<button id="explainBtn" onclick="explainTransaction()" disabled>✨ Explain My DID Transaction</button>

<div id="status" class="message-box">
    Click the "Register DID" button to begin the process.
</div>

<div id="geminiOutput" class="message-box gemini-output" style="display: none;">
    <h3>Gemini's Explanation</h3>
    <div id="geminiText"></div>
</div>

<script>
    // File: core_components/did_blockchain.js
    
    // Global variables to store transaction details for the LLM to use
    let lastTransaction = null;
    
    const statusDiv = document.getElementById('status');
    const geminiOutputDiv = document.getElementById('geminiOutput');
    const geminiTextDiv = document.getElementById('geminiText');
    const registerBtn = document.getElementById('registerBtn');
    const explainBtn = document.getElementById('explainBtn');

    /**
     * Simulates the generation of a DID and a PQC public key.
     * @returns {object} An object containing the generated DID and public key.
     */
    function generateDIDAndKey() {
        const did = `did:example:${Math.random().toString(36).substr(2, 10)}`;
        const pqcPublicKey = `-----BEGIN PUBLIC KEY-----\n...[PQC_KEY_DATA]...\n-----END PUBLIC KEY-----`;
        return { did, pqcPublicKey };
    }

    /**
     * Simulates a transaction to register a DID on a blockchain.
     */
    async function registerDIDOnBlockchain(did, publicKey) {
        return new Promise(resolve => {
            setTimeout(() => {
                const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
                resolve({ transactionHash });
            }, 3000); // Simulate 3-second block confirmation time.
        });
    }

    /**
     * The main function to orchestrate the DID registration process.
     */
    async function registerDID() {
        registerBtn.disabled = true;
        explainBtn.disabled = true;
        geminiOutputDiv.style.display = 'none';

        updateStatus('loading', 'Starting DID registration process...', 'Please wait...');
        try {
            const { did, pqcPublicKey } = generateDIDAndKey();
            updateStatus('loading', 'Generated DID and PQC Public Key.', `DID: ${did}`);

            updateStatus('loading', 'Broadcasting transaction to the blockchain...', 'This may take a moment...');
            const result = await registerDIDOnBlockchain(did, pqcPublicKey);

            const confirmationMessage = `✅ DID successfully registered on the blockchain.`;
            const transactionDetails = `Transaction Hash: ${result.transactionHash}\nDID: ${did}\nPublic Key: ${pqcPublicKey.slice(0, 50)}...`;
            
            // Store the transaction details to be used by the LLM
            lastTransaction = {
                did: did,
                txHash: result.transactionHash,
                publicKey: pqcPublicKey
            };

            updateStatus('success', confirmationMessage, transactionDetails);
            explainBtn.disabled = false;

        } catch (error) {
            updateStatus('error', '❌ Registration Failed.', `An error occurred: ${error.message}`);
            console.error(error);
        } finally {
            registerBtn.disabled = false;
        }
    }

    /**
     * Calls the Gemini API to explain the last transaction.
     */
    async function explainTransaction() {
        if (!lastTransaction) {
            alert('Please register a DID first!');
            return;
        }

        explainBtn.disabled = true;
        geminiOutputDiv.style.display = 'block';
        geminiTextDiv.innerHTML = '<p class="loading">Generating explanation with Gemini...</p>';

        try {
            const prompt = `Explain the following decentralized identity (DID) blockchain transaction in simple, non-technical terms for a beginner. 
            The goal is to explain what each part of the transaction means. 
            Transaction Hash: ${lastTransaction.txHash}
            DID (Decentralized Identifier): ${lastTransaction.did}
            Public Key: ${lastTransaction.publicKey.slice(0, 50)}...
            
            Format your response clearly, with a brief title and a few short paragraphs. Use analogies if helpful.`;

            const chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "" 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(payload)
                   });
            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                geminiTextDiv.innerHTML = text.replace(/\n/g, '<br>');
            } else {
                geminiTextDiv.innerHTML = 'Sorry, I couldn\'t generate an explanation at this time.';
                console.error('Gemini API response was not in the expected format:', result);
            }

        } catch (error) {
            geminiTextDiv.innerHTML = 'An error occurred while contacting the Gemini API.';
            console.error('API call failed:', error);
        } finally {
            explainBtn.disabled = false;
        }
    }

    /**
     * Updates the status message box with different styles and content.
     */
    function updateStatus(type, title, details) {
        statusDiv.className = `message-box ${type}`;
        statusDiv.innerHTML = `
            <h3>${title}</h3>
            <pre>${details}</pre>
        `;
    }
</script>

</body>
</html>
