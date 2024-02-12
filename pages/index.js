import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [interestRate, setInterestRate] = useState(5); // Default interest rate of 5%
  const [compoundFrequency, setCompoundFrequency] = useState("monthly"); // Default compounding frequency
  const [investmentFrequency, setInvestmentFrequency] = useState(3); // Default investment frequency of every 3 months
  const [interestEarned, setInterestEarned] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      setDepositAmount('');
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      setWithdrawAmount('');
      getBalance();
    }
  };

  const calculateInterest = () => {
    if (balance && interestRate && compoundFrequency) {
      let interest = 0;
      const rate = interestRate / 100; // Convert interest rate to decimal
      const n = compoundFrequency === "monthly" ? 12 : 1; // Monthly compounding or annual compounding
      const t = investmentFrequency / 12; // Time in years

      interest = balance * (Math.pow(1 + rate / n, n * t) - 1);
      setInterestEarned(interest.toFixed(2));
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }
  
    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }
  
    if (balance === undefined) {
      getBalance();
    }
  
    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Enter deposit amount" />
        <button onClick={deposit}>Deposit</button>
        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter withdrawal amount" />
        <button onClick={withdraw}>Withdraw</button>
        <label>
          Select Investment Frequency:
          <select value={investmentFrequency} onChange={(e) => setInvestmentFrequency(parseInt(e.target.value))}>
            <option value={3}>Every 3 Months</option>
            <option value={6}>Every 6 Months</option>
            <option value={9}>Every 9 Months</option>
            <option value={12}>Every 12 Months</option>
          </select>
        </label>
        <button onClick={calculateInterest}>Calculate Interest</button>
        {interestEarned > 0 && (
          <div>
            <p>Interest Rate: {interestRate}% Per annum </p>
            <p>Compounding Frequency: {compoundFrequency}</p>
            <p>Investment Frequency: Every {investmentFrequency} Months</p>
            <p>Interest Earned: {interestEarned} ETH</p>
          </div>
        )}
      </div>
    );
  };
  
  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>{initUser()}</div>
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
