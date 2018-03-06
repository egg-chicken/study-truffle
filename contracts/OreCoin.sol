pragma solidity ^0.4.17;

contract OreCoin {
    string public token_name;
    string public token_symbol;
    mapping (address => uint) public balances;

    event Send(address indexed from, address indexed to, uint value);

    function OreCoin(uint total_supply, string _token_name, string _token_symbol) public {
        balances[msg.sender] = total_supply;
        token_name = _token_name;
        token_symbol = _token_symbol;
    }

    function send(address to, uint value) public {
        require(value > 0 && value <= balances[msg.sender]);

        balances[msg.sender] -= value;
        balances[to] += value;
        Send(msg.sender, to, value);
    }
}
