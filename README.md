# Cardano Token Verification Tool
In Catalyst Fund 8, the NFT-Guild got funding for the project proposal [NFT Verification Tool](https://cardano.ideascale.com/c/idea/62083). The result of this project will be an open source tool that will aid Cardano token buyers in verifying the validity of a certain token.

This project will implement a tool to verify tokens defined according to CIP [88](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088) for Cardano tokens. CIP 88 is not yet released, but most of the details are good enough defined to get started. The standard specifies how to add structured verifiable data about the token project which is a welcome addition to the CIP 25 and CIP 26 that has been around since native tokens were introduced on Cardano in 2021.
Support for the CIP [68](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0068) will also be added if possible. Currently this standard does not explicitly define verification data to be present, which is mandatory to do verification and hence inhibits verification at this time.

On a high level we envision a tool that can be 
1. integrated into wallets and marketplace platforms
2. automatically queried through an API layer hosted by NFT Guild partners
3. manually queried (searched) by users that want to do check token project validity on a web site hosted by NFT Guild partners

Structure of this repository and what to find in the different directories
- tool - contains the source code for the tool itself
- test - contains useful resources to do testing
- doc - documentation of how to build and use the tool from the source code contained in tool directory
- resources - contains open source examples of smart contracts and other resources referenced by this directory which can be reviewed and reused by community developers
