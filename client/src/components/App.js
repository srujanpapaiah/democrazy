import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class App extends Component {
    state = { walletInfo: {}, blockCount: null };

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(json => this.setState({ walletInfo: json }));

        fetch(`${document.location.origin}/api/blocks`)
            .then(response => response.json())
            .then(json => this.setState({ blockCount: json.length }));
    }

    render() {
        const { address, balance } = this.state.walletInfo;
        const { blockCount } = this.state;

        return (
            <div className="page-container">
                <div className="hero-section">
                    <h1 className="hero-title">
                        Welcome to <span className="hero-gradient-text">Democrazy</span>
                    </h1>
                    <p className="hero-description">
                        A JavaScript Proof-of-Work blockchain. Explore blocks, send transactions, and mine rewards.
                    </p>
                    <div className="hero-nav">
                        <Link to="/conduct-transaction" className="hero-btn hero-btn-primary">
                            Send Transaction
                        </Link>
                        <Link to="/blocks" className="hero-btn hero-btn-secondary">
                            Explore Blocks
                        </Link>
                        <Link to="/transaction-pool" className="hero-btn hero-btn-secondary">
                            Transaction Pool
                        </Link>
                    </div>
                </div>

                {blockCount !== null && (
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-value">{blockCount}</div>
                            <div className="stat-label">Total Blocks</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                                {balance !== undefined ? balance : '...'}
                            </div>
                            <div className="stat-label">Your Balance</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>50</div>
                            <div className="stat-label">Mining Reward</div>
                        </div>
                    </div>
                )}

                <div className="wallet-card">
                    <div className="wallet-label">Your Wallet</div>
                    {address ? (
                        <div>
                            <div className="wallet-address">{address}</div>
                            <div className="wallet-balance">
                                <span className="balance-amount">{balance}</span>
                                <span className="balance-label">tokens</span>
                            </div>
                        </div>
                    ) : (
                        <div className="loading-container" style={{ padding: '1.5rem 0' }}>
                            <div className="loading-spinner"></div>
                            <span>Loading wallet...</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default App;
