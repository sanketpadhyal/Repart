import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-container" onClick={scrollToTop} style={{ textDecoration: 'none' }}>
              <img src="/assets/logo.png" alt="Repart" className="footer-logo" />
              <span className="footer-logo-text">Repart</span>
            </Link>
            <p className="footer-mission">
              Make understanding any software project as easy as opening a document.
            </p>
            <div className="footer-built-with">
              Built for developers <span className="heart">❤️</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><Link to="/blog#architecture-diagrams">Architecture Diagrams</Link></li>
                <li><Link to="/blog#api-explorer">API Explorer</Link></li>
                <li><Link to="/blog#database-analysis">Database Analysis</Link></li>
                <li><Link to="/blog#code-health">Code Health</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Roadmap</h4>
              <ul>
                <li><Link to="/blog#ai-explanations">AI Explanations</Link></li>
                <li><Link to="/blog#vscode-extension">VS Code Extension</Link></li>
                <li><Link to="/blog#ci-integration">CI Integration</Link></li>
                <li><Link to="/blog#team-workspaces">Team Workspaces</Link></li>
              </ul>
            </div>
            </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Repart. All rights reserved.</p>
          <div className="social-links">
            <a href="https://github.com/sanketpadhyal" target="_blank" rel="noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://sanketpadhyal.in" target="_blank" rel="noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
