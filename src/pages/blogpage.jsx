import React from 'react';
import './blogpage.css';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';

function BlogPage() {
  return (
    <div className="blog-page">
      <Navbar />
      
      <main className="blog-main">
        <article className="blog-article">
          <header className="blog-header">
            <div className="blog-meta">
              <span className="blog-date">March 15, 2026</span>
              <span className="blog-author">By The Repart Team</span>
            </div>
            <h1 className="blog-title">Introducing Repart: The Future of Codebase Analysis</h1>
          </header>
          
          <div className="blog-content">
            <p className="lead">
              Understanding a new codebase has historically been one of the most time-consuming and frustrating experiences for software engineers. Today, we're changing that.
            </p>
            
            <p>
              When a developer joins a new team or inherits an existing project, they are often faced with thousands of files, undocumented dependencies, and complex architecture that only lives in the minds of the original authors.
            </p>
            
            <h2 id="architecture-diagrams">Architecture Diagrams</h2>
            <p>
              Instantly generate interactive diagrams showing frontend, backend, services, databases, and external APIs. We map the data flow across your entire tech stack so you can visualize the system at a high level without reading a single file.
            </p>

            <h2 id="api-explorer">API Explorer</h2>
            <p>
              Automatically discover REST APIs, route structures, controllers, and middleware. Repart scans your routing definitions (whether Next.js App Router, Express, or Spring Boot) and generates a complete, searchable API map.
            </p>

            <h2 id="database-analysis">Database Analysis</h2>
            <p>
              Generate database relationships from ORMs like Prisma, Drizzle, Mongoose, and TypeORM. We extract your models and render them as a beautiful, interactive Entity-Relationship (ER) diagram, complete with foreign key relations and data types.
            </p>

            <h2 id="code-health">Code Health & Security</h2>
            <p>
              Detect large files, dead code, unused packages, hardcoded secrets, and unsafe APIs. Repart doesn't just show you how the code works; it shows you where the technical debt is hiding.
            </p>

            <blockquote>
              "Our goal is to make understanding any software project as easy as reading a well-written document."
            </blockquote>

            <h2>Roadmap to the Future</h2>

            <h2 id="ai-explanations">AI Explanations</h2>
            <p>
              While our core engine relies strictly on AST parsing for absolute precision, we are introducing opt-in AI layers. Soon, Repart will generate plain-english summaries of complex microservices and deeply nested logic, acting as your personal codebase tutor.
            </p>

            <h2 id="vscode-extension">VS Code Extension</h2>
            <p>
              Why leave your editor? We are bringing the full power of Repart's interactive architecture diagrams directly into VS Code, allowing you to explore dependencies alongside your source code.
            </p>

            <h2 id="ci-integration">CI Integration</h2>
            <p>
              Prevent architectural drift by integrating Repart into your CI/CD pipeline. Automatically generate updated architecture reports on every pull request, making code reviews faster and safer.
            </p>

            <h2 id="team-workspaces">Team Workspaces</h2>
            <p>
              Collaborate seamlessly. Team Workspaces will allow your entire engineering organization to share, annotate, and discuss codebase architectures in real-time, serving as the single source of truth for your system's design.
            </p>
            
            <p>
              Try Repart today, and stop wasting time reading files.
            </p>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}

export default BlogPage;
