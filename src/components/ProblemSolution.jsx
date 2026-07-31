import './problem.css';

function ProblemSolution() {
  return (
    <section className="problem-section">
      <div className="problem-container">
        <div className="section-header">
          <h2 className="section-title">The Codebase Problem</h2>
          <p className="section-subtitle">
            Understanding a new codebase is time-consuming. Developers spend hours figuring out project structure, APIs, databases, and dependencies.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card bad">
            <div className="card-header">
              <span className="card-badge">Before</span>
              <h3>GitHub shows you files.</h3>
            </div>
            <div className="card-body">
              <ul className="file-list">
                <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> src/api/userController.ts</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> src/db/schema.prisma</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> package.json</li>
                <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> docker-compose.yml</li>
                <li className="faded">...1,245 more files</li>
              </ul>
            </div>
          </div>

          <div className="comparison-card good">
            <div className="card-header">
              <span className="card-badge highlight">Repart</span>
              <h3>Repart shows you how it works.</h3>
            </div>
            <div className="card-body visual-body">
              <div className="abstract-visual">
                <div className="node db">Database</div>
                <div className="connection-line"></div>
                <div className="node api">API Layer</div>
                <div className="connection-line"></div>
                <div className="node ui">Frontend</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolution;
