import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component {
    state = { recipient: '', amount: '', status: null, statusMessage: '' };

    updateRecipient = event => {
        this.setState({ recipient: event.target.value });
    }

    updateAmount = event => {
        this.setState({ amount: event.target.value });
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        if (!recipient.trim()) {
            this.setState({ status: 'error', statusMessage: 'Please enter a recipient address.' });
            return;
        }

        if (!amount || Number(amount) <= 0) {
            this.setState({ status: 'error', statusMessage: 'Please enter a valid amount greater than 0.' });
            return;
        }

        this.setState({ status: 'loading', statusMessage: 'Submitting transaction...' });

        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient, amount: Number(amount) })
        })
            .then(response => response.json())
            .then(json => {
                if (json.type === 'error') {
                    this.setState({ status: 'error', statusMessage: json.message });
                } else {
                    this.setState({ status: 'success', statusMessage: 'Transaction submitted successfully!' });
                    setTimeout(() => history.push('/transaction-pool'), 1200);
                }
            })
            .catch(() => {
                this.setState({ status: 'error', statusMessage: 'Network error. Please try again.' });
            });
    }

    handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.conductTransaction();
        }
    }

    render() {
        const { recipient, amount, status, statusMessage } = this.state;

        return (
            <div className="page-container">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h2 className="page-title">Send Transaction</h2>
                    <p className="page-subtitle">Transfer tokens to another wallet address</p>
                </div>

                <div className="form-card">
                    {status && status !== 'loading' && (
                        <div className={`alert-bar ${status === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {statusMessage}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label-custom">Recipient Address</label>
                        <input
                            type="text"
                            className="form-control form-control-dark"
                            placeholder="Enter wallet address..."
                            value={recipient}
                            onChange={this.updateRecipient}
                            onKeyDown={this.handleKeyDown}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label-custom">Amount</label>
                        <input
                            type="number"
                            className="form-control form-control-dark"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={amount}
                            onChange={this.updateAmount}
                            onKeyDown={this.handleKeyDown}
                        />
                    </div>

                    <button
                        className="btn-gradient"
                        onClick={this.conductTransaction}
                        disabled={status === 'loading'}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        {status === 'loading' ? 'Submitting...' : 'Send Transaction'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/transaction-pool" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            View Transaction Pool
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConductTransaction;
