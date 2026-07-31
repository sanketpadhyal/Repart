import React from 'react';
import Navbar from '../components/navbar.jsx';
import Hero from '../components/Hero.jsx';
import ProblemSolution from '../components/ProblemSolution.jsx';
import DeveloperDuelFeature from '../components/DeveloperDuelFeature.jsx';
import Workflow from '../components/Workflow.jsx';
import Footer from '../components/Footer.jsx';

function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <DeveloperDuelFeature />
      <Workflow />
      <Footer />
    </div>
  );
}

export default HomePage;
