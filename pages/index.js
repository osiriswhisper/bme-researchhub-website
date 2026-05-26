import { useState, useMemo } from 'react';
import Head from 'next/head';
import { getAllPapers, getAllTopics } from '../lib/papers';

const TOPIC_COLORS = {
  'neural-interfaces':     '#00d4aa',
  'medical-imaging':       '#3b82f6',
  'wearables-biosensors':  '#f59e0b',
  'genomics-proteomics':   '#ec4899',
  'tissue-engineering':    '#10b981',
  'drug-delivery':         '#8b5cf6',
  'tinyml-edge-ai':        '#06b6d4',
  'signal-processing':     '#f97316',
  'surgical-robotics':     '#ef4444',
  'biomaterials':          '#a78bfa',
  'uncategorised':         '#6b7280',
};

function getAccent(slug) {
  return TOPIC_COLORS[slug] || '#00d4aa';
}

function getBadgeClass(quartile) {
  if (!quartile) return 'badge-q4';
  const q = quartile.toLowerCase();
  if (q === 'q1') return 'badge-q1';
  if (q === 'q2') return 'badge-q2';
  if (q === 'q3') return 'badge-q3';
  if (q === 'preprint') return 'badge-preprint';
  return 'badge-q4';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/---[\s\S]*?---/, '')
    .trim();
}

function PaperCard({ paper }) {
  const accent = getAccent(paper.topicSlug);
  const bodyText = stripMarkdown(paper.content).slice(0, 280);

  return (
    <div
      className="paper-card"
      style={{ '--card-accent': accent }}
      onClick={() => window.open(paper.link, '_blank', 'noopener')}
    >
      <div className="card-top">
        <div>
          <div className="card-topic">{paper.topic || paper.topicSlug}</div>
          <div className="card-date">{formatDate(paper.date)}</div>
        </div>
        <div className="card-badges">
          {paper.quartile && (
            <span className={`badge ${getBadgeClass(paper.quartile)}`}>
              {paper.quartile}
            </span>
          )}
          {paper.impact_factor && paper.impact_factor !== 'N/A' && paper.impact_factor !== '' && (
            <span className="badge badge-if">IF {paper.impact_factor}</span>
          )}
        </div>
      </div>

      <div className="card-title">{paper.title}</div>
      <div className="card-body">{bodyText}…</div>

      {paper.tags && paper.tags.length > 0 && (
        <div className="card-tags">
          {paper.tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <span className="card-journal">
          {paper.journal && paper.journal !== 'Unknown' ? paper.journal : paper.source || 'arxiv'}
        </span>
        <span className="card-link">Read →</span>
      </div>
    </div>
  );
}

export default function Home({ papers, topics }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = papers;
    if (activeFilter !== 'all') {
      list = list.filter(p => p.topicSlug === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.topic || '').toLowerCase().includes(q) ||
        ((p.tags || []).join(' ')).toLowerCase().includes(q)
      );
    }
    return list;
  }, [papers, activeFilter, search]);

  const topicCounts = useMemo(() => {
    const counts = {};
    for (const p of papers) {
      counts[p.topicSlug] = (counts[p.topicSlug] || 0) + 1;
    }
    return counts;
  }, [papers]);

  const tickerItems = topics.slice(0, 6).map(t =>
    `${t.replace(/-/g, ' ')} · ${topicCounts[t] || 0} papers`
  );
  const doubled = [...tickerItems, ...tickerItems];

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <>
      <Head>
        <title>BME Research Hub</title>
        <meta name="description" content="Weekly curated biomedical engineering research papers, auto-classified by topic." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="site-wrapper">
        <header className="site-header">
          <div className="header-inner">
            <div className="site-logo">BME Research Hub</div>
            <div className="site-tagline">Weekly · Auto-curated · AI-classified</div>
            <div className="header-meta">{now}</div>
          </div>
        </header>

        {/* Ticker */}
        {tickerItems.length > 0 && (
          <div className="ticker-wrap">
            <div className="ticker">
              {doubled.map((item, i) => (
                <span key={i} className="ticker-item">
                  <span>◆</span>{item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <strong>{papers.length}</strong>
            total papers
          </div>
          <div className="stat-item">
            <strong>{topics.length}</strong>
            topics
          </div>
          <div className="stat-item">
            <strong>
              {papers.filter(p => p.quartile === 'Q1').length}
            </strong>
            Q1 journals
          </div>
          <div className="stat-item">
            <strong>
              {papers.filter(p => p.quartile === 'Preprint').length}
            </strong>
            preprints
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search papers, topics, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '0.5rem 0.9rem',
              color: 'var(--text)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.78rem',
              outline: 'none',
              transition: 'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({papers.length})
          </button>
          {topics.map(topic => (
            <button
              key={topic}
              className={`filter-btn ${activeFilter === topic ? 'active' : ''}`}
              onClick={() => setActiveFilter(topic)}
              style={activeFilter === topic ? {
                background: getAccent(topic),
                borderColor: getAccent(topic),
                color: '#0a0c0f'
              } : {}}
            >
              {topic.replace(/-/g, ' ')} ({topicCounts[topic] || 0})
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="papers-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              {papers.length === 0
                ? '// No papers yet. Run the n8n workflow to populate this feed.'
                : '// No papers match this filter.'}
            </div>
          ) : (
            filtered.map(paper => (
              <PaperCard key={`${paper.topicSlug}-${paper.slug}`} paper={paper} />
            ))
          )}
        </div>

        <footer style={{
          borderTop: '1px solid var(--border)',
          marginTop: '4rem',
          padding: '2rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            BME Research Hub — auto-updated weekly via n8n + Groq
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            Sources: arxiv · bioRxiv · PubMed
          </span>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const papers = getAllPapers();
  const topics = getAllTopics();

  // Serialize dates to strings for Next.js
  const serialized = papers.map(p => ({
    ...p,
    date: p.date ? String(p.date) : '',
  }));

  return {
    props: { papers: serialized, topics },
  };
}
