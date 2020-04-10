let Ballot = artifacts.require("Ballot");

contract('Ballot', (accounts) => {
    before(async () => {
        this.ballot = await Ballot.deployed();
    });

    it('deploys successfully', async () => {
        assert.notEqual(this.ballot, undefined);
        const address = await this.ballot.address;
        assert.notEqual(address, 0x0, "");
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });

    it('sets stage', async () => {
        const stage = await this.ballot.stage();
        const data = stage.valueOf();
        assert.notEqual(data, 0);
        assert.notEqual(data, null);
        assert.notEqual(data, undefined);
        assert.equal(data, 1);
    });

    it('should register a valid user', async () => {
        let result = await this.ballot.register(accounts[1], {from: accounts[0]});
        assert.equal('0x01', result.receipt.status);
        result = await this.ballot.register(accounts[2], {from: accounts[0]});
        assert.equal('0x01', result.receipt.status);
        result = await this.ballot.register(accounts[3], {from: accounts[0]});
        assert.equal('0x01', result.receipt.status);
    });

    it('should accept votes from registered users', async () => {
        let result = await this.ballot.vote(2, {from: accounts[0]});
        assert.equal('0x01', result.receipt.status);
        result = await this.ballot.vote(1, {from: accounts[1]});
        assert.equal('0x01', result.receipt.status);
        result = await this.ballot.vote(0, {from: accounts[2]});
        assert.equal('0x01', result.receipt.status);
    });

    it('should select the right winning proposal', async () => {
        let win = await this.ballot.winningProposal();
        assert.equal(2, win.toNumber());
    });

    it('should not accept unauthorised registration', async () => {
        try {
            await this.ballot.register(accounts[4], {from: accounts[1]});
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('should not accept multiple registrations of same account', async () => {
        try {
            await this.ballot.register(accounts[1], {from: accounts[0]});
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('should not accept unregistered voters trying to vote', async () => {
        try {
            await this.ballot.vote(1, {from: accounts[4]});
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('should not accept voters trying to vote again', async () => {
        try {
            await this.ballot.vote(1, {from: accounts[0]});
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('should not accept votes for non-existing proposals', async () => {
        try {
            await this.ballot.vote(3, {from: accounts[3]});
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

});
