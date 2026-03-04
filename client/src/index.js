import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';
import './index.css';

const NavBar = () => (
    <nav className="navbar-main">
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" className="navbar-brand-custom">
                <span className="brand-icon">D</span>
                Democrazy
            </Link>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Link to="/blocks" className="nav-link-custom">Blocks</Link>
                <Link to="/conduct-transaction" className="nav-link-custom">Transact</Link>
                <Link to="/transaction-pool" className="nav-link-custom">Pool</Link>
            </div>
        </div>
    </nav>
);

const Layout = ({ children }) => (
    <div>
        <NavBar />
        {children}
    </div>
);

render(
    <Router history={history}>
        <Layout>
            <Switch>
                <Route exact path='/' component={App} />
                <Route path='/blocks' component={Blocks} />
                <Route path='/conduct-transaction' component={ConductTransaction} />
                <Route path='/transaction-pool' component={TransactionPool} />
            </Switch>
        </Layout>
    </Router>,
    document.getElementById('root')
);
