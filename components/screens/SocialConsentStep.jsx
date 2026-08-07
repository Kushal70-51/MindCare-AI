"use client";
import { useEffect, useState } from "react";

const PLATFORMS = [
  { id: "twitter", name: "Twitter / X", placeholder: "@username or profile link", icon: "𝕏" },
  { id: "instagram", name: "Instagram", placeholder: "@username", icon: "📸" },
  { id: "facebook", name: "Facebook", placeholder: "Profile link or username", icon: "🌐" },
  { id: "reddit", name: "Reddit", placeholder: "u/username", icon: "🤖" },
  { id: "linkedin", name: "LinkedIn", placeholder: "Profile URL", icon: "💼" },
];

export default function SocialConsentStep({ speak, onDone }) {
  const [consentGranted, setConsentGranted] = useState(true);
  const [encryptionConsent, setEncryptionConsent] = useState(true);
  const [accounts, setAccounts] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    reddit: "",
    linkedin: "",
  });
  const [activeTab, setActiveTab] = useState("consent"); // "consent" | "accounts"

  useEffect(() => {
    (async () => {
      await speak(
        "For a complete picture of your emotional wellbeing, you can connect your social media accounts.",
        "Your privacy is fully protected with end-to-end encryption. You can choose which accounts to link or skip anytime.",
        { pitch: 1.05 }
      );
    })();
  }, []);

  const handleAccountChange = (id, val) => {
    setAccounts((prev) => ({ ...prev, [id]: val }));
  };

  const getConnectedCount = () => {
    return Object.values(accounts).filter((v) => v.trim() !== "").length;
  };

  const handleProceed = (isSkip = false) => {
    const resultData = {
      consentGranted: isSkip ? false : consentGranted,
      encryptionConsent,
      connectedAccounts: isSkip ? {} : accounts,
      connectedCount: isSkip ? 0 : getConnectedCount(),
    };
    onDone(resultData);
  };

  return (
    <div className="controls social-consent-card">
      <div className="social-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === "consent" ? "active" : ""}`}
          onClick={() => setActiveTab("consent")}
        >
          🔒 Privacy &amp; Consent
        </button>
        <button
          className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          🔗 Link Accounts {getConnectedCount() > 0 && `(${getConnectedCount()})`}
        </button>
      </div>

      {activeTab === "consent" ? (
        <div className="consent-box">
          <div className="consent-header">
            <h4>Data Privacy &amp; Clinical Protection</h4>
            <p>We analyze social sentiment signals purely to detect mood patterns and burnout risk.</p>
          </div>

          <div className="consent-list">
            <label className="consent-item">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
              />
              <div className="consent-text">
                <strong>Anonymized Mood Analysis</strong>
                <span>Allow MindSense to evaluate publicly visible post sentiment for stress &amp; mood trends.</span>
              </div>
            </label>

            <label className="consent-item">
              <input
                type="checkbox"
                checked={encryptionConsent}
                onChange={(e) => setEncryptionConsent(e.target.checked)}
              />
              <div className="consent-text">
                <strong>Zero Third-Party Sharing</strong>
                <span>Your raw posts are never stored or sold. Analysis runs locally in your session sandbox.</span>
              </div>
            </label>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button
              className="btn primary"
              onClick={() => setActiveTab("accounts")}
            >
              Configure Social Accounts &rarr;
            </button>
            <button className="btn ghost" onClick={() => handleProceed(true)}>
              Skip Social Linking
            </button>
          </div>
        </div>
      ) : (
        <div className="accounts-box">
          <div className="accounts-header">
            <h4>Add Your Social Profiles</h4>
            <p>Optionally enter your handle or profile links to enrich your mental health assessment.</p>
          </div>

          <div className="platform-list">
            {PLATFORMS.map((platform) => {
              const val = accounts[platform.id];
              const isConnected = val.trim() !== "";
              return (
                <div key={platform.id} className={`platform-row ${isConnected ? "connected" : ""}`}>
                  <div className="platform-meta">
                    <span className="platform-icon">{platform.icon}</span>
                    <span className="platform-name">{platform.name}</span>
                  </div>
                  <input
                    type="text"
                    className="name platform-input"
                    placeholder={platform.placeholder}
                    value={val}
                    onChange={(e) => handleAccountChange(platform.id, e.target.value)}
                  />
                  <span className={`status-badge ${isConnected ? "on" : ""}`}>
                    {isConnected ? "Linked" : "Optional"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={() => handleProceed(false)}>
              Save Accounts &amp; Start Test
            </button>
            <button className="btn ghost" onClick={() => handleProceed(true)}>
              Skip &amp; Start Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
