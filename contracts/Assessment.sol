## azam khan 
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public interestEarned;
    uint256 public lastInterestCalculationTimestamp;
    uint256 public investmentFrequency; // Frequency in months

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event InterestCalculated(uint256 interestEarned);
    event InvestmentFrequencyUpdated(uint256 newFrequency);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        lastInterestCalculationTimestamp = block.timestamp; // Initialize the last interest calculation timestamp
        investmentFrequency = 3; // Default investment frequency is every 3 months
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;
        emit Deposit(_amount);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _withdrawAmount, "Insufficient balance");

        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
    }

    function calculateInterest(uint256 _interestRate) public {
        require(msg.sender == owner, "You are not the owner of this account");

        // Calculate the time elapsed since the last interest calculation
        uint256 timeElapsed = block.timestamp - lastInterestCalculationTimestamp;

        // Calculate the number of investment periods that have passed since the last calculation
        uint256 investmentPeriods = timeElapsed / (investmentFrequency * 30 days);

        // Calculate the interest earned based on the balance, interest rate, and number of investment periods
        interestEarned = (balance * _interestRate * investmentPeriods) / (100 * 12);

        // Update the last interest calculation timestamp
        lastInterestCalculationTimestamp += investmentPeriods * (investmentFrequency * 30 days);

        emit InterestCalculated(interestEarned);
    }

    // Function to update the investment frequency (cycle)
    function updateInvestmentFrequency(uint256 _newFrequency) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_newFrequency == 3 || _newFrequency == 6 || _newFrequency == 9 || _newFrequency == 12, "Invalid frequency");

        investmentFrequency = _newFrequency;
        emit InvestmentFrequencyUpdated(_newFrequency);
    }
}
