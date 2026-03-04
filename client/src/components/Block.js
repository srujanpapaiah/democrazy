import React, { Component } from 'react';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransaction: false };

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    render() {
        const { timestamp, hash, data } = this.props.block;
        const { blockNumber, isGenesis } = this.props;
        const { displayTransaction } = this.state;

        const hashDisplay = `${hash.substring(0, 20)}...${hash.substring(hash.length - 8)}`;
        const txCount = data.length;

        return (
            <div className="block-card">
                <div className="block-card-header" onClick={txCount > 0 ? this.toggleTransaction : undefined}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="block-number">
                            {isGenesis ? 'G' : blockNumber}
                        </div>
                        <div className="block-meta">
                            <div className="block-hash">{hashDisplay}</div>
                            <div className="block-time">
                                {isGenesis ? 'Genesis Block' : new Date(timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isGenesis && <span className="genesis-badge">Genesis</span>}
                        {txCount > 0 && (
                            <span className="block-tx-count">
                                {txCount} tx{txCount !== 1 ? 's' : ''}
                            </span>
                        )}
                        {txCount > 0 && (
                            <button className="block-toggle-btn" onClick={this.toggleTransaction}>
                                {displayTransaction ? 'Hide' : 'View'}
                            </button>
                        )}
                    </div>
                </div>

                {displayTransaction && txCount > 0 && (
                    <div className="block-transactions">
                        {data.map(transaction => (
                            <Transaction key={transaction.id} transaction={transaction} />
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default Block;
