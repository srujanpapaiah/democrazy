import React, { Component } from 'react';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {}, loading: true, mining: false };

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({ transactionPoolMap: json, loading: false }));
    }

    fetchMineTransactions = () => {
        this.setState({ mining: true });

        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({ mining: false });
                    history.push('/blocks');
                } else {
                    this.setState({ mining: false });
                    alert('Mining request did not complete. Try again.');
                }
            })
            .catch(() => {
                this.setState({ mining: false });
            });
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    render() {
        const { transactionPoolMap, loading, mining } = this.state;
        const transactions = Object.values(transactionPoolMap);

        return (
            <div className="page-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 className="page-title">Transaction Pool</h2>
                            <p className="page-subtitle">
                                {transactions.length > 0
                                    ? `${transactions.length} pending transaction${transactions.length !== 1 ? 's' : ''}`
                                    : 'Waiting for transactions...'
                                }
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/conduct-transaction" className="btn-outline-custom" style={{ textDecoration: 'none' }}>
                                New Transaction
                            </Link>
                            {transactions.length > 0 && (
                                <button
                                    className="btn-mine"
                                    onClick={this.fetchMineTransactions}
                                    disabled={mining}
                                >
                                    {mining ? 'Mining...' : 'Mine Transactions'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <span>Loading pool...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">&#9878;</div>
                        <div className="empty-state-text">No pending transactions</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            <Link to="/conduct-transaction" style={{ color: 'var(--accent-blue)' }}>
                                Send a transaction
                            </Link>
                            {' '}to see it appear here.
                        </p>
                    </div>
                ) : (
                    <div>
                        {transactions.map(transaction => (
                            <div key={transaction.id} style={{ marginBottom: '0.75rem' }}>
                                <Transaction transaction={transaction} />
                            </div>
                        ))}

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button
                                className="btn-mine"
                                onClick={this.fetchMineTransactions}
                                disabled={mining}
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                {mining ? 'Mining in progress...' : 'Mine All Transactions'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default TransactionPool;
