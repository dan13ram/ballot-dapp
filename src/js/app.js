App = {
    web3Provider: null,
    contracts: {},
    names: new Array(),
    url: 'http://127.0.0.1:9545',
    chairPerson:null,
    currentAccount:null,
    init: async function() {
        await App.populateProposals();
        await App.bindEvents();
        await App.initWeb3();
        await App.populateAddress();
        await App.initContract();
        await App.getChairperson();
        await App.updateVoteCount();
    },

    populateProposals: async function () {
        let data = await $.getJSON('../proposals.json');
        var proposalsRow = $('#proposalsRow');
        var proposalTemplate = $('#proposalTemplate');

        for (i = 0; i < data.length; i ++) {
            proposalTemplate.find('.panel-title').text(data[i].name);
            proposalTemplate.find('img').attr('src', data[i].picture);
            proposalTemplate.find('.btn-vote').attr('data-id', data[i].id);
            proposalTemplate.find('.num-vote').attr('id', 'num-vote-'+data[i].id);

            proposalsRow.append(proposalTemplate.html());
            App.names.push(data[i].name);
        }
    },

    updateVoteCount: async function () {
        let data = await App.ballot.getCount();
        jQuery.each(data, function(i) {
            $('#num-vote-'+i).html(data[i].toNumber())
        });
    },

    initWeb3: async function() {
        App.web3Provider = new Web3.providers.HttpProvider(App.url);
        window.web3 = new Web3(App.web3Provider);
    },

    populateAddress : async function(){
        let accounts = web3.eth.accounts;
        $('#account').html(accounts[0]);
        jQuery.each(accounts, function(i){
            if(web3.eth.coinbase != accounts[i]){
                var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
                jQuery('#enter_address').append(optionElement);  
            }
        });
    },

    initContract: async function() {
        let data = await $.getJSON('Ballot.json');
        App.contracts.Ballot = TruffleContract(data);
        App.contracts.Ballot.setProvider(App.web3Provider);
        App.ballot = await App.contracts.Ballot.deployed();

    },



    bindEvents: async function() {
        $(document).on('click', '.btn-vote', App.handleVote);
        $(document).on('click', '#win-count', App.handleWinner);
        $(document).on('click', '#register', async function(){ var ad = $('#enter_address').val(); await App.handleRegister(ad);   });
        window.ethereum.on('accountsChanged', function (accounts) {
            $('#account').html(accounts[0]);
        })
    },


    getChairperson : async function(){
        App.chairPerson = (await App.ballot.chairperson()).toString();
        App.currentAccount = web3.eth.coinbase;
        if(App.chairPerson != App.currentAccount){
            jQuery('#address_div').css('display','none');
            jQuery('#register_div').css('display','none');
        }else{
            jQuery('#address_div').css('display','block');
            jQuery('#register_div').css('display','block');
        }
    },

    handleRegister: async function(addr){
        let result = await App.ballot.register(addr);
        if(result.receipt.status == '0x1')
            alert(addr + " is registered successfully")
        else
            alert(addr + " account registeration failed due to revert")
    },

    handleVote: async function(event) {
        event.preventDefault();
        let proposalId = parseInt($(event.target).data('id'));
        let result = await App.ballot.vote(proposalId);
        let account = $('#account').html();
        if(result.receipt.status == '0x1')
            alert(account + " voting done successfully")
        else
            alert(account + " voting not done successfully due to revert")
        await App.updateVoteCount();
    },


    handleWinner : async function() {
        let res = await App.ballot.winningProposal();
        alert(App.names[res] + "  is the winner ! :)");
    }
};


$(function() {
    $(window).load(function() {
        App.init();
    });
});
