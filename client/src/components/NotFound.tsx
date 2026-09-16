import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="panel">
      <h1 className="h4">Page not found</h1>
      <p className="text-secondary">That route does not exist on this node.</p>
      <Link to="/" className="btn btn-danger">
        Back to overview
      </Link>
    </section>
  );
}
