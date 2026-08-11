import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight, User } from 'lucide-react';
import './duel-feature.css';

export default function DeveloperDuelFeature() {
  const navigate = useNavigate();

  const handleTryDuel = () => {
    const token = localStorage.getItem('repart_auth_token');
    if (token) {
      navigate('/dashboard/compare');
    } else {
      navigate('/?login=true');
    }
  };

  return (
    <section className="duel-feat-section">
      <div className="duel-feat-container">
        <div className="duel-gaming-badge">
          <span className="gaming-icon">⚔️</span>
          <span className="gaming-text">RANKED VS BATTLE ENGINE</span>
          <span className="gaming-live-dot"></span>
        </div>

        <h2 className="duel-feat-title">
          GitHub Developer Duel <span className="duel-gold-text">(VS Engine)</span>
        </h2>
        
        <p className="duel-feat-subtitle">
          Compare any two GitHub developers head-to-head. Evaluates both open-source popularity and pure engineering work quality regardless of follower counts.
        </p>

        {/* Mock Duel Card Preview with SVG icons */}
        <div className="duel-mock-card">
          <div className="mock-card-top">
            <div className="mock-user-box left">
              <div className="mock-avatar-wrap">
                <div className="mock-avatar-icon-circle left">
                  <User size={24} />
                </div>
                <span className="mock-badge mvp">WORK MVP</span>
              </div>
              <h4>Developer A 🖤</h4>
              <span className="mock-handle">@dev_alpha</span>
              <div className="mock-score-box">
                <span className="lbl">WORK QUALITY</span>
                <span className="val">95<small>/99</small></span>
              </div>
            </div>

            <div className="mock-vs">VS</div>

            <div className="mock-user-box right">
              <div className="mock-avatar-wrap">
                <div className="mock-avatar-icon-circle right">
                  <User size={24} />
                </div>
                <span className="mock-badge reach">REACH MVP</span>
              </div>
              <h4>Developer B 🖤</h4>
              <span className="mock-handle">@dev_beta</span>
              <div className="mock-score-box reach">
                <span className="lbl">POWER RATING</span>
                <span className="val">99<small>/99</small></span>
              </div>
            </div>
          </div>

          <div className="mock-verdict-bar">
            <Wrench size={16} className="v-icon" />
            <span><strong>Work Quality MVP:</strong> @dev_alpha leads in type safety & original codebase density</span>
          </div>
        </div>

        <div className="duel-cta-wrap">
          <button onClick={handleTryDuel} className="duel-launch-btn">
            Launch Developer Duel <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
