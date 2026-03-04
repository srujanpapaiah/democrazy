import React from 'react';

const Transaction = ({ transaction }) => {
    const { input, outputMap } = transaction;
    const recipients = Object.keys(outputMap);
    const isMiningReward = input.address === '*authorized-reward*';

    if (isMiningReward) {
        const minerAddress = recipients[0];
        return (
            <div className="transaction-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <span className="tx-mining-reward">Mining Reward</span>
                    </div>
                    <div className="tx-amount tx-amount-sent">+{outputMap[minerAddress]}</div>
                </div>
                <div className="tx-row" style={{ marginTop: '0.5rem' }}>
                    <span className="tx-label">To</span>
                    <span className="tx-address">{`${minerAddress.substring(0, 24)}...`}</span>
                </div>
            </div>
        );
    }

    const senderAddress = input.address;

    return (
        <div className="transaction-item">
            <div className="tx-row">
                <span className="tx-label">From</span>
                <span className="tx-address">{`${senderAddress.substring(0, 24)}...`}</span>
                <span className="tx-amount tx-amount-balance" style={{ marginLeft: 'auto' }}>
                    Balance: {input.amount}
                </span>
            </div>
            {recipients.map(recipient => (
                <div className="tx-recipient" key={recipient}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="tx-label" style={{ minWidth: 'auto' }}>
                            {recipient === senderAddress ? 'Change' : 'To'}
                        </span>
                        <span className="tx-address">{`${recipient.substring(0, 20)}...`}</span>
                    </div>
                    <span className={`tx-amount ${recipient === senderAddress ? 'tx-amount-balance' : 'tx-amount-sent'}`}>
                        {recipient === senderAddress ? outputMap[recipient] : `${outputMap[recipient]}`}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Transaction;
