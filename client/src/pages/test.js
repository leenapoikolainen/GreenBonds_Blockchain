import { useEffect, useState } from "react";

// Import interact functions
import { connectWallet, getCurrentWalletConnected } from "../utils/interact";


const Test = (props) => {
    //State variables
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setURL] = useState("");

    // Function for wallet listener
    function addWalletListener() {
        if(window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if(accounts.length > 0) {
                    setWallet(accounts[0]);
                    setStatus("👆🏽 Write a message in the text-field above.");
                } else {
                    setWallet("");
                    setStatus("🦊 Connect to Metamask using the top right button.");
                }
            });
        } else {
            setStatus(
                <p>
                    {" "}
                    🦊{" "}
                    <a target="_blank" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your
                        browser.
                    </a>
                </p>
            );
        }
    }

    // Gets current wallet automatically when page is refreshed
    useEffect(async () => { 
        const { address, status } = await getCurrentWalletConnected();
        setWallet(address);
        setStatus(status);

        // Add wallet listener
        addWalletListener();
    }, []);

    // Connects a wallet
    const connectWalletPressed = async () => { 
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
    };

    const onMintPressed = async () => { //TODO: implement
        
    };

    return (
        <div className="Minter">
            <button id="walletButton" onClick={connectWalletPressed}>
                {walletAddress.length > 0 ? (
                    "Connected: " +
                    String(walletAddress).substring(0,6) +
                    "..." +
                    String(walletAddress).substring(38)
                ) : (
                    <span>Connect Wallet</span>
                )}
            </button>
            <br></br>
        </div>
  );
};

export default Test;