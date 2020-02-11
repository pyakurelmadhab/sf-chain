const ChainUtil = require('../chain-util');

class Transaction {
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if (amount > senderOutput.amount) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recipient});
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static NewTransaction(senderWallet, recipient, amount) {
        const transcation = new this();

        if (amount > senderWallet.balance){
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        transcation.outputs.push(...[
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            { amount, address: recipient }
        ])
        Transaction.signTransaction(transcation, senderWallet);

        return transcation;
    }

    static signTransaction(transcation, senderWallet) {
        transcation.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transcation.outputs))
        }
    }

    static verifyTransaction(transcation){
        return ChainUtil.verifySignature(
            transcation.input.address,
            transcation.input.signature,
            ChainUtil.hash(transcation.outputs)
        );
    }
}

module.exports = Transaction;