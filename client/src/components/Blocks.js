import React, { Component } from 'react';
import Block from './Block';

class Blocks extends Component {
    state = { blocks: [], loading: true };

    componentDidMount() {
        fetch(`${document.location.origin}/api/blocks`)
            .then(response => response.json())
            .then(json => this.setState({ blocks: json, loading: false }));
    }

    render() {
        const { blocks, loading } = this.state;

        return (
            <div className="page-container">
                <div className="page-header">
                    <h2 className="page-title">Block Explorer</h2>
                    <p className="page-subtitle">
                        {blocks.length > 0 ? `${blocks.length} blocks on the chain` : 'Loading blocks...'}
                    </p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <span>Loading blockchain...</span>
                    </div>
                ) : (
                    blocks.map((block, index) => (
                        <Block
                            key={block.hash}
                            block={block}
                            blockNumber={blocks.length - index}
                            isGenesis={index === 0}
                        />
                    )).reverse()
                )}
            </div>
        );
    }
}

export default Blocks;
