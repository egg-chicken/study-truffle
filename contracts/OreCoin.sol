pragma solidity ^0.4.17;

contract OreCoin {
    string public token_name;
    string public token_symbol;
    address public owner;
    mapping (address => uint) public balances;
    mapping (address => uint) public rebate_rates;
    mapping (address => int8) public blocked_addresses;

    event SendCoin(address indexed from, address indexed to, uint value);

    modifier onlyOwner() { require(msg.sender == owner); _; }

    function OreCoin(uint total_supply, string _token_name, string _token_symbol) public {
        owner = msg.sender;
        balances[owner] = total_supply;
        token_name = _token_name;
        token_symbol = _token_symbol;
    }

    function sendCoin(address to, uint value) public {
        require(value > 0 && value <= balances[msg.sender]);
        require(blocked_addresses[to] <= 0);
        require(blocked_addresses[msg.sender] <= 0);

        value = value - (value * rebate_rates[msg.sender] / 100);

        balances[msg.sender] -= value;
        balances[to] += value;
        SendCoin(msg.sender, to, value);
    }

    function blockAddress(address addr) onlyOwner public {
        blocked_addresses[addr] = 1;
    }

    function unblockAddress(address addr) onlyOwner public {
        blocked_addresses[addr] = -1;
    }

    function setRebateRates(uint rate) public {
        require(rate <= 100);
        rebate_rates[msg.sender] = rate;
    }
}
