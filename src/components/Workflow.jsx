import './workflow.css';

function Workflow() {
  const steps = [
    { title: "Paste URL", desc: "Submit any public GitHub repository link." },
    { title: "Clone & Parse", desc: "We securely clone and build an AST of the codebase." },
    { title: "Generate & Clean", desc: "Analysis is generated, then the source code is deleted." },
    { title: "View Report", desc: "Explore the interactive architecture dashboard." }
  ];

  return (
    <section className="workflow-section">
      <div className="workflow-container">
        
        <div className="workflow-header">
          <h2>How It Works</h2>
          <p>A completely automated pipeline. Just provide the URL.</p>
        </div>

        <div className="workflow-timeline">
          {steps.map((step, index) => (
            <div className="workflow-step" key={index}>
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Workflow;
