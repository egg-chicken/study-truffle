pragma solidity ^0.4.17;

import "./Owned.sol";
import "./Members.sol";

contract OreCoin is Owned {
    string public token_name;
    string public token_symbol;
    mapping (address => uint) public balances;
    mapping (address => int8) public blocked_addresses;
    mapping (address => Members) public members_map;

    event SendCoin(address indexed from, address indexed to, uint value);

    function OreCoin(uint total_supply, string _token_name, string _token_symbol) public {
        balances[owner] = total_supply;
        token_name = _token_name;
        token_symbol = _token_symbol;
    }

    function sendCoin(address to, uint value) public {
        require(value > 0 && value <= balances[msg.sender]);
        require(blocked_addresses[to] <= 0);
        require(blocked_addresses[msg.sender] <= 0);

        value = discount(to, value);

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

    function setMembers(address members) public {
        members_map[msg.sender] = Members(members);
    }

    function discount(address to, uint value) private returns (uint) {
        Members members = members_map[to];
        if(members > address(0)) {
            uint discountRate = members.getDiscountRate(to);
            value = value - (value * discountRate / 100);
            members.addTransactionAmount(to, value);
        }
        return value;
    }
}
