import { Link } from "react-router-dom";

const css = `
  .mk *, .mk *::before, .mk *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .mk { --ink:#0f0f0f; --paper:#f5f2eb; --paper-warm:#ede9df; --red:#c0392b; --red-dark:#922b21; --gold:#b8860b; --mid:#4a4a4a; --light:#8a8a8a; --rule:#d0cbbe; --white:#ffffff; }
  .mk { background:var(--paper); color:var(--ink); font-family:'Source Serif 4',Georgia,serif; font-size:17px; line-height:1.7; -webkit-font-smoothing:antialiased; }
  .mk p { color:var(--mid); margin-bottom:1.2rem; font-size:1rem; }
  .mk p:last-child { margin-bottom:0; }
  .mk strong { color:var(--ink); font-weight:600; }

  .mk .cover { background:var(--ink); color:var(--white); min-height:100vh; display:grid; grid-template-rows:auto 1fr auto; position:relative; overflow:hidden; }
  .mk .cover::before { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.03) 59px,rgba(255,255,255,0.03) 60px); pointer-events:none; }
  .mk .cover-top { padding:2.5rem 3.5rem; border-bottom:1px solid rgba(255,255,255,0.12); display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
  .mk .cover-label { font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.4); }
  .mk .cover-year { font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.15em; color:rgba(255,255,255,0.4); }
  .mk .cover-main { display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding:4rem 3.5rem; position:relative; z-index:1; }
  .mk .cover-flag { display:inline-block; background:var(--red); color:var(--white); font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; padding:0.4rem 0.9rem; margin-bottom:2.5rem; }
  .mk .cover-wordmark { font-family:'Playfair Display',serif; font-weight:900; font-size:clamp(4rem,10vw,7.5rem); line-height:0.92; letter-spacing:-0.02em; color:var(--white); margin-bottom:1.2rem; }
  .mk .cover-wordmark span { color:var(--red); }
  .mk .cover-tagline { font-family:'Source Serif 4',serif; font-style:italic; font-weight:300; font-size:1.4rem; color:rgba(255,255,255,0.6); margin-bottom:3.5rem; max-width:520px; line-height:1.5; }
  .mk .cover-divider { width:60px; height:2px; background:var(--red); margin-bottom:2rem; }
  .mk .cover-meta { display:grid; grid-template-columns:repeat(3,auto); gap:3rem; }
  .mk .cover-meta-item label { display:block; font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:0.3rem; }
  .mk .cover-meta-item span { font-family:'Source Serif 4',serif; font-size:0.95rem; color:rgba(255,255,255,0.85); }
  .mk .cover-bottom { padding:2rem 3.5rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
  .mk .cover-url { font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:rgba(255,255,255,0.4); letter-spacing:0.05em; }
  .mk .cover-confidential { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.25); }

  .mk .content { max-width:900px; margin:0 auto; padding:5rem 3.5rem; }
  .mk .section { margin-bottom:5rem; padding-bottom:5rem; border-bottom:1px solid var(--rule); }
  .mk .section:last-child { border-bottom:none; }
  .mk .section-header { display:flex; align-items:baseline; gap:1.2rem; margin-bottom:2.5rem; }
  .mk .section-num { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; color:var(--red); text-transform:uppercase; flex-shrink:0; padding-top:0.15rem; }
  .mk .section-title { font-family:'Playfair Display',serif; font-weight:700; font-size:1.9rem; line-height:1.15; letter-spacing:-0.01em; color:var(--ink); }
  .mk .section-rule { flex:1; height:1px; background:var(--rule); margin-bottom:0.35rem; }

  .mk .pull-quote { border-left:3px solid var(--red); padding:1.5rem 2rem; background:var(--paper-warm); margin:2.5rem 0; }
  .mk .pull-quote p { font-family:'Playfair Display',serif; font-size:1.25rem; font-style:italic; color:var(--ink); line-height:1.5; margin:0; }

  .mk .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--rule); border:1px solid var(--rule); margin:2rem 0; }
  .mk .stat-box { background:var(--white); padding:2rem 1.5rem; text-align:center; }
  .mk .stat-box .num { font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:900; color:var(--red); line-height:1; display:block; margin-bottom:0.4rem; }
  .mk .stat-box .label { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--light); }

  .mk .feature-list { list-style:none; margin:1.5rem 0; }
  .mk .feature-list li { display:flex; gap:1rem; align-items:flex-start; padding:0.9rem 0; border-bottom:1px solid var(--rule); color:var(--mid); font-size:1rem; }
  .mk .feature-list li:last-child { border-bottom:none; }
  .mk .feature-list li::before { content:'—'; color:var(--red); font-family:'JetBrains Mono',monospace; flex-shrink:0; margin-top:0.05rem; }
  .mk .feature-list li strong { color:var(--ink); }

  .mk .two-col { display:grid; grid-template-columns:1fr 1fr; gap:3rem; margin:2rem 0; }
  .mk .col-head { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--rule); }

  .mk .feed-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin:2rem 0; }
  .mk .feed-tag { background:var(--ink); color:var(--white); padding:0.6rem 1rem; font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.1em; display:flex; align-items:center; gap:0.6rem; }
  .mk .feed-tag::before { content:'●'; color:var(--red); font-size:0.5rem; }
  .mk .feed-tag.wire { background:var(--paper-warm); color:var(--ink); border:1px solid var(--rule); }
  .mk .feed-tag.wire::before { color:var(--gold); }
  .mk .feed-tag.coming-soon { opacity:0.6; font-style:italic; }

  .mk .audience-block { background:var(--ink); color:var(--white); padding:2.5rem; margin:2rem 0; }
  .mk .audience-block h3 { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:1.5rem; }
  .mk .audience-items { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
  .mk .audience-item label { display:block; font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:0.3rem; }
  .mk .audience-item span { font-family:'Source Serif 4',serif; font-size:0.95rem; color:rgba(255,255,255,0.85); }

  .mk .contact-box { background:var(--red); color:var(--white); padding:3rem; display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; margin-top:2rem; }
  .mk .contact-box h3 { font-family:'Playfair Display',serif; font-size:1.4rem; margin-bottom:0.5rem; grid-column:1 / -1; }
  .mk .contact-item label { display:block; font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.6); margin-bottom:0.3rem; }
  .mk .contact-item span { font-size:0.95rem; color:var(--white); }
  .mk .contact-item a { color:var(--white); text-decoration:underline; }

  .mk .mandate { background:var(--paper-warm); border:1px solid var(--rule); padding:2.5rem; margin:2rem 0; }
  .mk .mandate-head { font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--light); margin-bottom:1rem; }
  .mk .mandate p { font-size:0.95rem; line-height:1.75; }

  .mk .sl-banner { background:var(--ink); padding:2.5rem 3rem; margin:2rem 0; display:flex; align-items:center; gap:2rem; }
  .mk .sl-badge { background:var(--red); color:var(--white); font-family:'Playfair Display',serif; font-weight:900; font-size:1.1rem; padding:0.8rem 1.2rem; line-height:1.2; flex-shrink:0; text-align:center; }
  .mk .sl-text h4 { font-family:'Playfair Display',serif; color:var(--white); font-size:1.1rem; margin-bottom:0.4rem; }
  .mk .sl-text p { font-size:0.9rem; color:rgba(255,255,255,0.6); margin:0; }

  .mk .kit-footer { background:var(--ink); color:rgba(255,255,255,0.4); text-align:center; padding:2.5rem; font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.15em; }
  .mk .kit-footer a { color:rgba(255,255,255,0.6); }

  .mk .back-bar { background:var(--ink); padding:0.75rem 1.5rem; display:flex; align-items:center; gap:1rem; }
  .mk .back-bar a { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.5); text-decoration:none; transition:color 0.2s; }
  .mk .back-bar a:hover { color:rgba(255,255,255,0.9); }

  @media (max-width: 680px) {
    .mk .cover-main, .mk .cover-top, .mk .cover-bottom { padding:2rem 1.5rem; }
    .mk .content { padding:3rem 1.5rem; }
    .mk .stats-grid { grid-template-columns:1fr; }
    .mk .two-col, .mk .audience-items, .mk .feed-grid { grid-template-columns:1fr; }
    .mk .contact-box { grid-template-columns:1fr; }
    .mk .cover-meta { grid-template-columns:1fr; gap:1.2rem; }
  }
`;

export default function MediaKit() {
  return (
    <div className="mk">
      <style>{css}</style>

      {/* Back to site bar */}
      <div className="back-bar">
        <Link to="/">← holdthenorth.news</Link>
      </div>

      {/* COVER */}
      <section className="cover">
        <div className="cover-top">
          <span className="cover-label">Media Kit — Press Resource</span>
          <span className="cover-year">2026 Edition</span>
        </div>

        <div className="cover-main">
          <span className="cover-flag">Canadian Independent Media</span>
          <h1 className="cover-wordmark">Hold<br /><span>The</span><br />North</h1>
          <p className="cover-tagline">Canada's editorial news platform — built for Canadians who demand more than headlines.</p>
          <div className="cover-divider" />
          <div className="cover-meta">
            <div className="cover-meta-item">
              <label>Platform</label>
              <span>holdthenorth.news</span>
            </div>
            <div className="cover-meta-item">
              <label>Social</label>
              <span>@holdthenorth</span>
            </div>
            <div className="cover-meta-item">
              <label>Press Contact</label>
              <span><a href="mailto:press@holdthenorth.news" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>press@holdthenorth.news</a></span>
            </div>
          </div>
        </div>

        <div className="cover-bottom">
          <span className="cover-url">holdthenorth.news</span>
          <span className="cover-confidential">For Media &amp; Partner Use</span>
        </div>
      </section>

      {/* CONTENT */}
      <div className="content">

        {/* 01 WHO WE ARE */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">01</span>
            <h2 className="section-title">Who We Are</h2>
            <div className="section-rule" />
          </div>
          <p><strong>Hold The North (HTN)</strong> is an independent Canadian news aggregation and commentary platform built for everyday Canadians who want to understand what's happening in their country — without the spin, the noise, or the paywall.</p>
          <p>HTN operates as an editorially independent institution. We are not the voice of any political party, funding body, or corporate interest. Our editorial judgment is applied daily by Canadians, for Canadians.</p>
          <div className="pull-quote">
            <p>"HTN exists because Canadians deserve a platform that curates the news with the same care they'd apply themselves — if they had the time."</p>
          </div>
          <p>We aggregate from Canada's most credible newsrooms — legacy broadcasters, independent outlets, and wire services — and apply editorial judgment every morning to surface what matters most to Canadian life, policy, and sovereignty.</p>
        </section>

        {/* 02 MISSION */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">02</span>
            <h2 className="section-title">Mission &amp; Editorial Mandate</h2>
            <div className="section-rule" />
          </div>
          <div className="mandate">
            <div className="mandate-head">Editorial Independence Statement</div>
            <p>Hold The North is editorially independent. No government body, advertiser, or political organization directs our coverage. HTN does not advocate for any political party. Our mandate is to surface the stories that matter to Canadians — regardless of which newsroom broke them, and regardless of which political perspective they reflect.</p>
          </div>
          <p>Our editorial mission rests on three commitments:</p>
          <ul className="feature-list">
            <li><span><strong>Breadth</strong> — We draw from across Canada's full media spectrum, from CBC and CTV to independent outlets like The Breach, Rabble, and Canada's National Observer.</span></li>
            <li><span><strong>Judgment</strong> — Every story that appears on HTN has passed through human editorial review. We do not publish algorithms. We publish decisions.</span></li>
            <li><span><strong>Accessibility</strong> — HTN is built for the Canadian who reads the news on a lunch break, not the Ottawa insider who reads Hansard for fun. Plain language, clear context, no jargon.</span></li>
          </ul>
        </section>

        {/* 03 PLATFORM */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">03</span>
            <h2 className="section-title">The Platform</h2>
            <div className="section-rule" />
          </div>
          <p>HTN launched as a fully operational, professional-grade platform. Every feature was built before the first story was published.</p>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="num">6+</span>
              <span className="label">Live Newsroom Feeds</span>
            </div>
            <div className="stat-box">
              <span className="num">3</span>
              <span className="label">Editorial Sections</span>
            </div>
            <div className="stat-box">
              <span className="num">Daily</span>
              <span className="label">Curated Digest</span>
            </div>
          </div>
          <ul className="feature-list">
            <li><span><strong>Editorial Dashboard</strong> — Live RSS aggregation from Canadian newsrooms with full editorial control. Stories are hand-selected each morning or auto-published from fully trusted sources.</span></li>
            <li><span><strong>Commentary</strong> — Original HTN editorial perspective on stories that carry national significance.</span></li>
            <li><span><strong>Membership Model</strong> — Free to read. Voluntary contributions support the platform and fund emerging Canadian journalists. Powered by Stripe.</span></li>
            <li><span><strong>Street Level</strong> — A dedicated section for Gen Z Canadian voices and emerging journalists. Structured contributor pathway with editorial support.</span></li>
            <li><span><strong>Wire Integration</strong> — Canadian Press and additional free news wire services feed the dashboard alongside newsroom RSS.</span></li>
          </ul>
        </section>

        {/* 04 CONTENT SOURCES */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">04</span>
            <h2 className="section-title">Content Sources</h2>
            <div className="section-rule" />
          </div>
          <p>HTN draws from Canada's broadest editorial spectrum. Our dashboard integrates live feeds from the following sources, with editorial judgment applied at every publication decision:</p>
          <div className="feed-grid">
            <div className="feed-tag">CBC News</div>
            <div className="feed-tag">Global News</div>
            <div className="feed-tag">The Breach</div>
            <div className="feed-tag">Rabble.ca</div>
            <div className="feed-tag">Canada's National Observer</div>
            <div className="feed-tag wire coming-soon">Canadian Press Wire — coming soon</div>
            <div className="feed-tag wire">Additional Free Wire Services</div>
          </div>
          <p>HTN is not ideologically aligned with any single source. We curate across the spectrum because Canada's news landscape does not fit neatly into left or right — and neither do Canadians.</p>
        </section>

        {/* 05 STREET LEVEL */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">05</span>
            <h2 className="section-title">Street Level</h2>
            <div className="section-rule" />
          </div>
          <div className="sl-banner">
            <div className="sl-badge">Street<br />Level</div>
            <div className="sl-text">
              <h4>Canada's Platform for Emerging Voices</h4>
              <p>A dedicated editorial section within HTN for Gen Z Canadian journalists, writers, and community voices breaking through for the first time.</p>
            </div>
          </div>
          <p>Street Level exists because the next generation of Canadian journalism needs a place to land. We offer emerging writers a structured editorial pathway — pitch, publish, be read by a national audience, and eventually be paid for the work.</p>
          <div className="two-col">
            <div>
              <div className="col-head">For Contributors</div>
              <ul className="feature-list">
                <li><span>Open submission process</span></li>
                <li><span>Editorial feedback and support</span></li>
                <li><span>National platform from day one</span></li>
                <li><span>Path to paid contribution</span></li>
              </ul>
            </div>
            <div>
              <div className="col-head">Target Contributor Profile</div>
              <ul className="feature-list">
                <li><span>Post-secondary journalism students</span></li>
                <li><span>Campus media writers</span></li>
                <li><span>Community journalists under 30</span></li>
                <li><span>First Nations and diverse voices</span></li>
              </ul>
            </div>
          </div>
          <p>Post-secondary journalism programs and student publications interested in a partnership with Street Level are encouraged to contact us directly.</p>
        </section>

        {/* 06 AUDIENCE */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">06</span>
            <h2 className="section-title">Our Audience</h2>
            <div className="section-rule" />
          </div>
          <p>HTN is built for Canadians who are news-aware, civically engaged, and increasingly skeptical of corporate media consolidation. Our readers don't want to be told what to think — they want the information to think for themselves.</p>
          <div className="audience-block">
            <h3>Audience Profile</h3>
            <div className="audience-items">
              <div className="audience-item">
                <label>Primary Audience</label>
                <span>News-aware Canadians, 30–60, urban and rural</span>
              </div>
              <div className="audience-item">
                <label>Secondary Audience</label>
                <span>Gen Z Canadians via Street Level</span>
              </div>
              <div className="audience-item">
                <label>Influential Readers</label>
                <span>Civil society, independent journalists, educators</span>
              </div>
              <div className="audience-item">
                <label>Geographic Focus</label>
                <span>Pan-Canadian, English language</span>
              </div>
            </div>
          </div>
        </section>

        {/* 07 MEMBERSHIP */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">07</span>
            <h2 className="section-title">Membership &amp; Support</h2>
            <div className="section-rule" />
          </div>
          <p>Hold The North is free to read — always. Our membership model is built on the belief that Canadians who value independent journalism will voluntarily support the work that keeps it independent.</p>
          <ul className="feature-list">
            <li><span><strong>Free Access</strong> — Every story, every section, no paywall. Ever.</span></li>
            <li><span><strong>Voluntary Contributions</strong> — Members choose what to give. Contributions directly fund platform operations and emerging journalist compensation.</span></li>
            <li><span><strong>Stripe-Powered</strong> — Secure, transparent, and Canadian-compliant payment processing.</span></li>
            <li><span><strong>Member Recognition</strong> — Contributing members acknowledged with consent. Community, not transaction.</span></li>
          </ul>
          <p>HTN does not carry advertising. Our editorial independence is not for sale.</p>
        </section>

        {/* 08 CONTACT */}
        <section className="section">
          <div className="section-header">
            <span className="section-num">08</span>
            <h2 className="section-title">Press &amp; Partner Contact</h2>
            <div className="section-rule" />
          </div>
          <p>Hold The North welcomes media inquiries, partnership proposals, and contributor outreach from journalists, educators, civil society organizations, and Canadian newsrooms.</p>
          <div className="contact-box">
            <h3>Get In Touch</h3>
            <div className="contact-item">
              <label>Media Inquiries</label>
              <span><a href="mailto:press@holdthenorth.news">press@holdthenorth.news</a></span>
            </div>
            <div className="contact-item">
              <label>Street Level Submissions</label>
              <span><a href="mailto:streetlevel@holdthenorth.news">streetlevel@holdthenorth.news</a></span>
            </div>
            <div className="contact-item">
              <label>Partnerships</label>
              <span><a href="mailto:partnerships@holdthenorth.news">partnerships@holdthenorth.news</a></span>
            </div>
            <div className="contact-item">
              <label>General</label>
              <span><a href="mailto:hello@holdthenorth.news">hello@holdthenorth.news</a></span>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="kit-footer">
        © 2026 HOLD THE NORTH — HOLDTHENORTH.NEWS — FOR MEDIA &amp; PARTNER USE
      </footer>
    </div>
  );
}
