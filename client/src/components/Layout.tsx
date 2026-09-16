import { NavLink, Outlet } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/blocks', label: 'Blocks', end: false },
  { to: '/conduct-transaction', label: 'Send', end: false },
  { to: '/transaction-pool', label: 'Pool', end: false },
] as const;

/** App shell: the persistent header and nav wrapped around every route. */
export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="container" aria-label="Main">
          <NavLink to="/" className="brand">
            Democrazy
          </NavLink>
          <ul className="nav-links">
            {NAV_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'nav-link is-active' : 'nav-link'
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="container app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">Proof-of-work blockchain · demo node</div>
      </footer>
    </div>
  );
}
