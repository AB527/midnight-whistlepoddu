# Midnight Whistlepoddu

A privacy-preserving corporate identity and anonymous chat platform built on the **Midnight blockchain**. This project allows users to verify their workplace via ID extraction (simulated) and subsequently generate Zero-Knowledge Proofs (ZKP) to attach a company name hash to their wallet. Once verified, users can participate in a global chat where their company affiliation is visible, but their personal identity remains completely hidden.

## Why This Matters

In corporate environments, sharing honest feedback or whistleblowing is often risky. Current platforms like Glassdoor or Blind either hold sensitive user data (creating "honeypots" for hackers) or lack a cryptographic way to prove a user actually works where they claim.

**Midnight Whistlepoddu** introduces a new paradigm:
1. **Verified Anonymity**: You prove you belong to "Company X" without revealing your name, employee ID, or position.
2. **Zero-Knowledge Verification**: The network confirms your company affiliation with mathematical certainty, without the blockchain ever seeing your original ID document.
3. **Reduced Liability**: Because the system uses ZKPs, there is no central database of sensitive employee IDs, protecting both the user and the platform.

## Why ZKPs and Midnight?

Standard blockchains are public, meaning if you proved your employment on-chain, your wallet would be permanently linked to your job. Zero-Knowledge Proofs (ZKPs) allow you to prove a statement is true (e.g., "I work at this company") without revealing the evidence itself. 



[Image of zero-knowledge proof concept]


Midnight provides the underlying network to make these proofs part of a real-time application. This opens up utility across the corporate world:
- **Secure Whistleblowing**: Reporting internal issues with the authority of a verified employee but the safety of an anonymous actor.
- **Industry Networking**: Creating spaces where only verified professionals in specific sectors can interact without fear of corporate surveillance.
- **Verified Feedback**: Providing management with unfiltered data that is cryptographically guaranteed to come from within the organization.

## Project Structure

- **`contracts/`**: Compact smart contract logic and ZK circuits that handle company name commitments and verification.
- **`frontend/`**: React-based dashboard for the (simulated) ID upload and the gated global chat interface.
- **`cli/`**: Node.js based command-line interface for manual proof generation and testing the Midnight SDK.
- **`scripts/`**: Utility scripts for contract deployment and managing the local developer environment.

## Technical Architecture & Current Challenges

The system utilizes Midnight's Zero-Knowledge capabilities to ensure personal data stays local. During development, we adapted the project to address two specific technical hurdles:

1. **Assumed Extraction**: Currently, the project does not include a live OCR engine. The extraction of the "Company Name" from the ID is assumed/simulated to focus on the ZKP hashing and wallet integration.
2. **Compact Language Data Structures**: We found that the `Vector` data structure in the **Compact** language did not behave as expected for our specific state requirements. To maintain a functional demo, we have pivoted to using **Local Storage** as a database solution for chat persistence and indexing.

### Current Deployed Contract

The application is configured to interact with the following contract address on the local network:
`20358cff6f29133c20060554794d1a662c33944fd3df47ebd993c9ec7c097350`

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Midnight Lace Wallet extension
- Midnight Proof Server (running locally on port 6300)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment**:  
   Ensure your frontend configuration points to the correct contract address and local proof server.

### Running the Application

- **Start Frontend**:

    ```bash
    cd frontend && npm run dev
    ```

- **Start CLI**:

    ```bash
    cd cli && npm start
    ```

---

### Security Considerations

This project is a prototype for demonstration purposes. Since extraction is currently assumed and message data is stored in Local Storage, please do not use real-world sensitive documents or private data in this environment.
