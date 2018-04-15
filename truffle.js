module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganacheNetwork: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          // Create private "chainskills" network with network id 4224
          privateNetwork: {
            host: "localhost",
            port: 8545,
            network_id: "4224", // Match any network id
            // Resolve gas limit error encountered with deploying to private network, truffle bug //
            gas: 4700000
            // Default is using first account, coinbase to deploy contracts
            // customize account where contracts are deployed, second account from web3.eth.accounts
            // from: '0xcd9de0f455bb9bf45a618d72392d887a62ea0644'


          }
     }
};
