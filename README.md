# WebLift
**Website modernization scanner** — Crawl the web from seed URLs and automatically score each site on outdated design and SEO signals to identify your best modernization leads.

## Live Demo
https://scope-opal-chi.vercel.app/

## Features

* **Automated Web Crawling:** Feed seed URLs (single or comma-separated) and let the crawler traverse and discover connected pages.
* **Modernization Scoring:** Automatically evaluates sites against outdated design heuristics and SEO optimization criteria.
* **Priority Lead Generation:** Ranks discovered sites by score to highlight high-potential modernization targets.
* **Configurable Crawl Scope:** Toggle external domain following to stay within seed domains or cast a wider net.

---

## Tech Stack

* **Frontend:** EJS, Tailwind CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Data & Crawling:** Asynchronous web crawling queue, seed URL parsing, and scoring algorithms
* **Hosting & Deployment:** Render & Vercel

---

## Environment Setup

Create a `.env` file in the root directory with the following configuration:

```env
PORT=3000
DB_STRING=your_mongodb_connection_string_here

```

---

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/scope.git
cd scope

```


2. Install dependencies:
```bash
npm install

```


3. Run the development server:
```bash
npm start

```


