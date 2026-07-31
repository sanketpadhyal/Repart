import React from 'react';
import {
  Code, Layers, ShieldCheck, Cpu, ExternalLink,
  Activity, Terminal, ArrowRight, User
} from 'lucide-react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import './DevelopersPage.css';

const GithubIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export default function DevelopersPage() {
  return (
    <div className="dev-page">
      <Navbar />

      <main className="dev-main">
        <section className="dev-hero">
          <h1 className="dev-hero-title">
            Engineered by Developers, <br /> Free & Open Source for Everyone
          </h1>
          <p className="dev-hero-sub">
            Repart is completely open-sourced on GitHub! Feel free to explore the repository, fork the source code, self-host your own instance, or contribute to the project.
          </p>
        </section>

        <section className="dev-card">
          <div className="dev-card-head">
            <div className="dev-head-icon"><Layers size={20} /></div>
            <div>
              <h2>About Repart Platform</h2>
              <p>Instant automated codebase analysis, AST parsing, and multi-tier system visualization</p>
            </div>
          </div>

          <div className="dev-about-content">
            <p className="dev-text-lead">
              Repart is a developer intelligence platform designed to eliminate onboarding friction and help software engineers, recruiters, and engineering leads instantly visualize any software codebase.
            </p>
            <p className="dev-text">
              By parsing repository trees, configuration manifests, and directory conventions, Repart automatically discovers Frontend UI layers, Backend API endpoints, Data Persistence layers, Package Dependencies, and Security Hygiene metrics without requiring any manual setup.
            </p>
          </div>

          <div className="dev-feature-grid">
            <div className="dev-feature-item">
              <div className="dev-feat-icon"><Code size={18} /></div>
              <div>
                <h4>Multi-Tier Architecture Detection</h4>
                <p>Categorizes repository code into Frontend, Backend, Database, Auth, and Testing layers.</p>
              </div>
            </div>

            <div className="dev-feature-item">
              <div className="dev-feat-icon"><Terminal size={18} /></div>
              <div>
                <h4>Real-Time SSE Event Scanner</h4>
                <p>Streams multi-step scanning logs in real time from backend analysis workers.</p>
              </div>
            </div>

            <div className="dev-feature-item">
              <div className="dev-feat-icon"><ShieldCheck size={18} /></div>
              <div>
                <h4>Static Security Hygiene Audit</h4>
                <p>Evaluates repository security score, secret exposure risk, and license configurations.</p>
              </div>
            </div>

            <div className="dev-feature-item">
              <div className="dev-feat-icon"><Activity size={18} /></div>
              <div>
                <h4>Developer Skill Matrix & Velocity</h4>
                <p>Calculates developer archetypes, lines of code, and active contribution streaks.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="dev-card">
          <div className="dev-card-head">
            <div className="dev-head-icon"><User size={20} /></div>
            <div>
              <h2>Meet the Creator</h2>
              <p>Architect & Lead Engineer behind Repart</p>
            </div>
          </div>

          <div className="dev-creator-profile">
            <img
              src="https://github.com/sanketpadhyal.png"
              alt="Sanket Padhyal"
              className="dev-creator-avatar"
              onError={(e) => {
                e.currentTarget.src = '/assets/logo.png';
              }}
            />
            <div className="dev-creator-info">
              <div className="dev-creator-name-row">
                <h3 className="dev-creator-name">Sanket Padhyal</h3>
                <span className="dev-creator-handle">@sanketpadhyal</span>
              </div>
              <p className="dev-creator-bio">
                Full-stack developer and system designer passionate about creating fast, secure web applications, developer tools, and interactive system visualizers.
              </p>

              <div className="dev-links-grid">
                <a
                  href="https://github.com/sanketpadhyal"
                  target="_blank"
                  rel="noreferrer"
                  className="dev-link-btn"
                >
                  <GithubIcon size={16} />
                  <span>GitHub Profile</span>
                  <ExternalLink size={13} className="dev-link-arrow" />
                </a>

                <a
                  href="https://github.com/sanketpadhyal/Repart"
                  target="_blank"
                  rel="noreferrer"
                  className="dev-link-btn primary"
                >
                  <Code size={16} />
                  <span>Repart Repository</span>
                  <ExternalLink size={13} className="dev-link-arrow" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="dev-card">
          <div className="dev-card-head">
            <div className="dev-head-icon"><Cpu size={20} /></div>
            <div>
              <h2>Platform Technology Stack</h2>
              <p>Core framework, backend engine, and styling design system</p>
            </div>
          </div>

          <div className="dev-stack-grid">
            <div className="dev-stack-box">
              <span className="dev-stack-category">FRONTEND ENGINE</span>
              <h4>React 19 & React Router v7</h4>
              <p>Responsive dashboard layout, Recharts data visualization, and Outfit typography.</p>
            </div>

            <div className="dev-stack-box">
              <span className="dev-stack-category">BACKEND ANALYSIS API</span>
              <h4>Node.js & Express.js</h4>
              <p>Server-Sent Events (SSE) streaming engine, rate limiting, and GitHub API v3 integration.</p>
            </div>

            <div className="dev-stack-box">
              <span className="dev-stack-category">CODEBASE PARSER</span>
              <h4>AST & Manifest Scanner</h4>
              <p>Static file tree analyzer, package manifest parser, and security hygiene audit rules.</p>
            </div>

            <div className="dev-stack-box">
              <span className="dev-stack-category">DESIGN SYSTEM</span>
              <h4>Repart Gold/Bronze Tokens</h4>
              <p>Curated color system (#8c6b22), off-white background (#fdfdfb), and crisp mobile-first CSS.</p>
            </div>
          </div>
        </section>

        <section className="dev-card dev-repo-banner">
          <div className="dev-repo-content">
            <GithubIcon size={32} className="dev-repo-icon" />
            <div>
              <h3>Open Sourced on GitHub — Free to Use, Fork & Contribute</h3>
              <p className="dev-repo-subtext">Repart is 100% open source. You can inspect the source code, fork the repo, or use it for your own projects.</p>
              <p className="dev-repo-url">https://github.com/sanketpadhyal/Repart</p>
            </div>
          </div>
          <a
            href="https://github.com/sanketpadhyal/Repart"
            target="_blank"
            rel="noreferrer"
            className="dev-repo-btn"
          >
            <span>Explore Repository</span> <ArrowRight size={16} />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
