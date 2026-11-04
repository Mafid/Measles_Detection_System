import { Link } from "react-router-dom";

function Home() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">

                        <h1>
                            Measles Detection
                        </h1>

                        <p className="hero-description">
                            A multimodal deep learning system that combines skin image
                            analysis with clinical symptoms to support research on
                            accurate measles detection.
                        </p>

                        <div className="hero-actions">
                            <Link to="/detection" className="primary-button">
                                Start Detection
                                <span>→</span>
                            </Link>

                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="visual-card">
                            <div className="visual-header">
                                <span>Multimodal Analysis</span>
                            </div>

                            <div className="visual-image">
                                <div className="image-placeholder">
                                    <div className="medical-icon">✚</div>
                                    <span>Skin Image</span>
                                    <small>Image feature extraction</small>
                                </div>
                            </div>

                            <div className="feature-section">
                                <div className="feature-title">
                                    <span>Clinical Features</span>
                                    <span>5 inputs</span>
                                </div>

                                <div className="feature-grid">
                                    <div>Fever</div>
                                    <div>Cough</div>
                                    <div>Red eyes</div>
                                    <div>Koplik spots</div>
                                    <div>Vaccinated</div>
                                </div>
                            </div>

                            <div className="fusion-line">
                                <div></div>
                                <span>Feature Fusion</span>
                                <div></div>
                            </div>

                            <div className="prediction-preview">
                                <div>
                                    <small>Model Output</small>
                                    <strong>Multimodal Classification</strong>
                                </div>

                                <div className="prediction-icon">AI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Research Section */}
            <section className="research-section" id="research">
                <div className="section-container">
                    <div className="section-heading">
                        <span className="section-label">THE APPROACH</span>

                        <h2>
                            Combining two sources of
                            <br />
                            <span>clinical evidence</span>
                        </h2>

                        <p>
                            The proposed system integrates visual information from skin
                            images with structured clinical features before making the
                            final classification.
                        </p>
                    </div>

                    <div className="approach-grid">
                        <div className="approach-card">
                            <div className="card-number">01</div>
                            <div className="card-icon">◉</div>
                            <h3>Skin Image</h3>
                            <p>
                                Visual features are extracted from the uploaded skin image
                                using a deep convolutional neural network.
                            </p>
                            <div className="card-tech">MobileNetV2</div>
                        </div>

                        <div className="approach-card">
                            <div className="card-number">02</div>
                            <div className="card-icon">+</div>
                            <h3>Clinical Information</h3>
                            <p>
                                Five clinical features are processed through a dedicated
                                neural network branch.
                            </p>
                            <div className="clinical-tags">
                                <span>Fever</span>
                                <span>Cough</span>
                                <span>Red eyes</span>
                                <span>Koplik spots</span>
                                <span>Vaccinated</span>
                            </div>
                        </div>

                        <div className="approach-card highlighted">
                            <div className="card-number">03</div>
                            <div className="card-icon">✦</div>
                            <h3>Feature Fusion</h3>
                            <p>
                                Image and clinical representations are combined to produce
                                the multimodal classification output.
                            </p>
                            <div className="card-tech">Deep Feature Fusion</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section
            <section className="about-section" id="about">
                <div className="section-container about-container">
                    <div>
                        <span className="section-label">ABOUT THE PROJECT</span>
                        <h2>
                            A research-focused approach to
                            <span> multimodal diagnosis.</span>
                        </h2>
                    </div>

                    <div className="about-text">
                        <p>
                            This project investigates whether combining skin image
                            information with clinical symptoms can improve automated
                            measles classification compared with using a single source
                            of information.
                        </p>

                        <Link to="/detection" className="text-link">
                            Try the research prototype →
                        </Link>
                    </div>
                </div>
            </section> */}
        </>
    );
}

export default Home;