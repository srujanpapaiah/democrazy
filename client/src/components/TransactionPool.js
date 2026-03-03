import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import { Link, useNavigate } from 'react-router-dom';

const POLL_INTERVAL_MS = 10000;

function TransactionPool() {
    const [transactionPoolMap, setTransactionPoolMap] = useState({});
    const navigate = useNavigate();

    const fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => setTransactionPoolMap(json));
    };

    const fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if (response.status === 200) {
                    alert('success');
                    navigate('/blocks');
                } else {
                    alert('The mine-transactions block request did not complete.');
                }
            });
    };

    useEffect(() => {
        fetchTransactionPoolMap();
        const interval = setInterval(fetchTransactionPoolMap, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='TransactionPool'>
            <div><Link to='/'>Home</Link></div>
            <h3>Transaction Pool</h3>
            {Object.values(transactionPoolMap).map(transaction => (
                <div key={transaction.id}>
                    <hr />
                    <Transaction transaction={transaction} />
                </div>
            ))}
            <hr />
            <Button variant='danger' onClick={fetchMineTransactions}>
                Mine the Transactions
            </Button>
        </div>
    );
}

export default TransactionPool;