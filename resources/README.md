# About the resources

## Validators
Both of the following smart contracts are Aiken versions of the concept smart contracts originating from cent-development repository basic-smart-contracts.

### owner_can_mint_policy
This is a simple smart contract minting policy that is tigtly linked to the connected wallet extension.
Once the link has been made, this minting policy allows the owner wallet to mint any number of tokens one likes.

### public_micro_drive
Basic smart contract validator that allows spending of contract assets only by the wallet it is tightly connected to. "Public" signifies that the contract is publicly available on-chain, but the assets contained are only spendable by the owner. "Micro Drive" signifies that the contract can serve as a small decentralized storage of "publicly visible" assets. In this project this storage is used to contain CIP 68 reference tokens and possibly CIP 48 referenced metadata which is an extention of CIP 88.