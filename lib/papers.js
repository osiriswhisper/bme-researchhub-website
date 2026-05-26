import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const PAPERS_DIR = path.join(process.cwd(), 'content', 'papers');

export function getAllTopics() {
  if (!fs.existsSync(PAPERS_DIR)) return [];
  return fs.readdirSync(PAPERS_DIR).filter(f =>
    fs.statSync(path.join(PAPERS_DIR, f)).isDirectory()
  );
}

export function getAllPapers() {
  const topics = getAllTopics();
  const papers = [];

  for (const topic of topics) {
    const topicDir = path.join(PAPERS_DIR, topic);
    const files = fs.readdirSync(topicDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(topicDir, file), 'utf8');
      const { data, content } = matter(raw);
      papers.push({
        slug: file.replace('.md', ''),
        topicSlug: topic,
        content,
        ...data
      });
    }
  }

  // Sort newest first
  return papers.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPapersByTopic(topicSlug) {
  return getAllPapers().filter(p => p.topicSlug === topicSlug);
}
