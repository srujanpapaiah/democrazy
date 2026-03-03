import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function ConductTransaction() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState(0);
    const navigate = useNavigate();

    const submitTransaction = () => {
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient, amount })
        })
            .then(response => response.json())
            .then(json => {
                alert(json.message || json.type);
                navigate('/transaction-pool');
            });
    };

    return (
        <div className='ConductTransaction'>
            <Link to='/'>Home</Link>
            <h3>Conduct a Transaction</h3>
            <Form.Group className='mb-3'>
                <Form.Control
                    type='text'
                    placeholder='recipient'
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                />
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Control
                    type='number'
                    placeholder='amount'
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                />
            </Form.Group>
            <div>
                <Button variant='danger' onClick={submitTransaction}>
                    Submit
                </Button>
            </div>
        </div>
    );
}

export default ConductTransaction;