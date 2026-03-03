import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

function Block({ block }) {
    const [displayTransaction, setDisplayTransaction] = useState(false);

    const { timestamp, hash, data } = block;
    const hashDisplay = `${hash.substring(0, 15)}...`;

    const stringifiedData = JSON.stringify(data);
    const dataDisplay = stringifiedData.length > 35
        ? `${stringifiedData.substring(0, 35)}...`
        : stringifiedData;

    return (
        <div className='Block'>
            <div>Hash: {hashDisplay}</div>
            <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
            {displayTransaction ? (
                <div>
                    {data.map(transaction => (
                        <div key={transaction.id}>
                            <hr />
                            <Transaction transaction={transaction} />
                        </div>
                    ))}
                    <br />
                    <Button
                        variant='danger'
                        size='sm'
                        onClick={() => setDisplayTransaction(false)}
                    >
                        Show Less
                    </Button>
                </div>
            ) : (
                <div>
                    <div>Data: {dataDisplay}</div>
                    <Button
                        variant='danger'
                        size='sm'
                        onClick={() => setDisplayTransaction(true)}
                    >
                        Show More
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Block;