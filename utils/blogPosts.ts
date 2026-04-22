/**
 * Blog post registry.
 * Single source of truth for blog post metadata and content.
 * Used by pages/blog/[slug].vue and pages/blog/index.vue.
 */

export interface TocItem {
  id: string
  title: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string // ISO
  author: string
  authorTitle?: string
  readMinutes: number
  image: string
  tags: string[]
  toc: TocItem[]
  /** Rich HTML content. Headings should use ids matching toc[].id */
  content: string
}

const thumb = (slug: string) => `/assets/images/blog/thumbnails/${slug}.svg`

export const blogPosts: BlogPost[] = [
  {
    slug: 'slack-vs-teams-vs-discord-2025-guide',
    title: 'Slack vs Microsoft Teams vs Discord: The Ultimate 2025 Team Communication Guide',
    excerpt:
      'A side-by-side comparison of the three biggest team-chat platforms — covering pricing, workflow fit, integrations, and security — so you can pick the right tool instead of defaulting to what everyone else uses.',
    category: 'Software Comparison',
    date: '2025-08-21',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 12,
    image: thumb('slack-vs-teams-vs-discord-2025-guide'),
    tags: ['Slack', 'Microsoft Teams', 'Discord', 'Collaboration', 'Remote Work'],
    toc: [
      { id: 'overview', title: 'Platform overview' },
      { id: 'pricing', title: 'Pricing at a glance' },
      { id: 'features', title: 'Feature comparison' },
      { id: 'fit', title: 'Which team is each one best for?' },
      { id: 'security', title: 'Security & compliance' },
      { id: 'verdict', title: 'Final verdict' }
    ],
    content: `
      <h2 id="overview">Platform overview</h2>
      <p>
        Team messaging tools look interchangeable on the surface. In practice, Slack, Microsoft Teams,
        and Discord each optimize for very different workflows — and picking the wrong one quietly
        taxes every knowledge worker you hire for years.
      </p>
      <p>
        Slack is a purpose-built work chat with deep integrations and a clean channel model.
        Microsoft Teams is a collaboration hub bolted onto Office 365 — excellent if you already live
        in Microsoft 365, less so otherwise. Discord started in gaming and has matured into a
        community-first platform with unmatched voice quality.
      </p>

      <h2 id="pricing">Pricing at a glance</h2>
      <ul>
        <li><strong>Slack</strong> — Free tier (90-day message retention), Pro at $8.75/user/month, Business+ at $15.</li>
        <li><strong>Microsoft Teams</strong> — Bundled with Microsoft 365 Business ($6+/user/month); standalone free tier available.</li>
        <li><strong>Discord</strong> — Free for unlimited members; Nitro ($9.99/month) is per-user cosmetics, not team features.</li>
      </ul>

      <h2 id="features">Feature comparison</h2>
      <p>
        If you care about <em>threaded conversations</em>, Slack is still the gold standard.
        Teams threads feel noisy by comparison. Discord's threads work well for communities but
        lack the granular notification controls professionals expect.
      </p>
      <p>
        For <em>integrations</em>, Slack's marketplace has 2,600+ apps and the best developer
        experience. Teams integrates natively with the Microsoft stack (SharePoint, OneDrive,
        Planner), which is a killer feature if you're already on Office. Discord's bot ecosystem is
        rich but geared toward community automation, not B2B workflows.
      </p>

      <h2 id="fit">Which team is each one best for?</h2>
      <p>
        <strong>Pick Slack</strong> if your team prizes async clarity, runs cross-functional projects,
        and will actually use integrations and automations.
      </p>
      <p>
        <strong>Pick Teams</strong> if Microsoft 365 is already your core productivity suite or if
        you're in a regulated industry where IT wants a single vendor.
      </p>
      <p>
        <strong>Pick Discord</strong> if you're building a community, a creator brand, or a public
        support channel — its voice rooms and "server" mental model beat the alternatives.
      </p>

      <h2 id="security">Security & compliance</h2>
      <p>
        All three offer enterprise SSO and encryption in transit. Teams has the broadest compliance
        certifications (HIPAA, FedRAMP High). Slack Enterprise Grid covers most regulated
        industries. Discord is not intended for regulated data and should be treated accordingly.
      </p>

      <h2 id="verdict">Final verdict</h2>
      <p>
        For most knowledge-work teams in 2025: <strong>Slack</strong> if you can afford it, <strong>Teams</strong>
        if you're already paying for Microsoft 365, and <strong>Discord</strong> only for
        community-facing work. Don't mix them internally — pick one, commit, and invest in training.
      </p>
    `
  },
  {
    slug: 'hubspot-vs-salesforce-vs-pipedrive-crm-comparison',
    title: 'HubSpot vs Salesforce vs Pipedrive: CRM Showdown 2025',
    excerpt:
      'Three very different philosophies of the CRM — inbound-first, enterprise-first, and pipeline-first. We break down the real-world trade-offs so you buy the one you\'ll actually use.',
    category: 'Software Comparison',
    date: '2025-08-20',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 14,
    image: thumb('hubspot-vs-salesforce-vs-pipedrive-crm-comparison'),
    tags: ['CRM', 'HubSpot', 'Salesforce', 'Pipedrive', 'Sales'],
    toc: [
      { id: 'overview', title: 'Three philosophies' },
      { id: 'pricing', title: 'Pricing & TCO' },
      { id: 'usability', title: 'Usability & adoption' },
      { id: 'automation', title: 'Automation & AI' },
      { id: 'fit', title: 'Which team is each one for?' },
      { id: 'verdict', title: 'Final verdict' }
    ],
    content: `
      <h2 id="overview">Three philosophies</h2>
      <p>
        HubSpot sells a unified growth platform — marketing, sales, service, and CMS — optimized for
        inbound. Salesforce is the "build anything" platform of record for enterprise. Pipedrive is
        unapologetically a sales-rep tool with pipeline management at its heart.
      </p>

      <h2 id="pricing">Pricing & TCO</h2>
      <p>
        On paper, all three have reasonable starter plans. In practice, TCO is where they diverge.
        Salesforce commonly adds 30–50% on top of license costs for integrations and admin time.
        HubSpot pricing scales steeply as your contact list grows. Pipedrive stays predictable but
        lacks the breadth you may need in year two.
      </p>

      <h2 id="usability">Usability & adoption</h2>
      <p>
        Rep adoption is the single biggest predictor of CRM ROI. Pipedrive wins on this axis —
        reps close deals in it voluntarily. HubSpot is close behind, with a modern UX. Salesforce's
        Lightning UI is powerful but demanding, and adoption typically needs a full-time admin.
      </p>

      <h2 id="automation">Automation & AI</h2>
      <p>
        Salesforce's Einstein and Flow Builder remain the deepest. HubSpot's workflows are the
        easiest to build for marketers. Pipedrive's Smart Contact Data and AI Sales Assistant are
        surprisingly good for a focused tool — but they stop at sales-ops boundaries.
      </p>

      <h2 id="fit">Which team is each one for?</h2>
      <p><strong>Small businesses and marketing-led teams:</strong> HubSpot.</p>
      <p><strong>Enterprise, regulated industries, or heavy customization:</strong> Salesforce.</p>
      <p><strong>Small, deal-driven sales teams that just need a pipeline:</strong> Pipedrive.</p>

      <h2 id="verdict">Final verdict</h2>
      <p>
        Most buyers regret over-buying. If you have fewer than 20 salespeople and no dedicated CRM
        admin, start with HubSpot or Pipedrive. Move to Salesforce only when you hit its features as
        hard constraints — not before.
      </p>
    `
  },
  {
    slug: 'notion-vs-monday-vs-asana-project-management',
    title: 'Notion vs Monday vs Asana: Project Management Platform Battle',
    excerpt:
      'Three tools that claim to run your team\'s work — but only one will actually fit. Here\'s how Notion, Monday, and Asana compare on structure, flexibility, and long-term maintainability.',
    category: 'Software Comparison',
    date: '2025-08-19',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 11,
    image: thumb('notion-vs-monday-vs-asana-project-management'),
    tags: ['Notion', 'Monday', 'Asana', 'Project Management', 'Productivity'],
    toc: [
      { id: 'overview', title: 'How they differ' },
      { id: 'structure', title: 'Structure vs flexibility' },
      { id: 'scaling', title: 'Does it scale with the team?' },
      { id: 'fit', title: 'Which one fits your workflow?' },
      { id: 'verdict', title: 'Final verdict' }
    ],
    content: `
      <h2 id="overview">How they differ</h2>
      <p>
        Notion is a flexible document-first workspace. Monday is a visual, database-style work OS.
        Asana sits in between — a structured task tracker with a strong opinion on projects and
        ownership.
      </p>

      <h2 id="structure">Structure vs flexibility</h2>
      <p>
        Notion gives you infinite flexibility and therefore zero opinion. That's liberating early and
        crushing at scale. Monday's rigid-but-friendly boards encourage consistency but can feel
        heavy for simple tasks. Asana strikes a balance — projects and tasks are first-class citizens
        with sensible defaults.
      </p>

      <h2 id="scaling">Does it scale with the team?</h2>
      <p>
        Notion workspaces over 50 people almost always need a librarian. Monday scales cleanly with
        automations and dashboards but costs rise fast. Asana is the most predictable for 50–500
        person teams — governance is built in.
      </p>

      <h2 id="fit">Which one fits your workflow?</h2>
      <p><strong>Knowledge work + docs + personal OS:</strong> Notion.</p>
      <p><strong>Ops-heavy teams, repeatable workflows, client work:</strong> Monday.</p>
      <p><strong>Product, marketing, cross-functional execution:</strong> Asana.</p>

      <h2 id="verdict">Final verdict</h2>
      <p>
        Don't pick based on which demo looked prettiest. Look at the last three projects you ran.
        If they had messy structure, pick Monday or Asana. If they had clear structure but messy
        docs, pick Notion.
      </p>
    `
  },
  {
    slug: '10-ai-tools-small-business-2025',
    title: '10 AI Tools Every Small Business Should Actually Use in 2025',
    excerpt:
      'Cutting through the hype — 10 AI tools with concrete ROI for small and mid-sized businesses, categorized by workflow so you can find wins fast.',
    category: 'AI & Automation',
    date: '2025-08-16',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 10,
    image: thumb('10-ai-tools-small-business-2025'),
    tags: ['AI', 'Automation', 'Small Business', 'Productivity'],
    toc: [
      { id: 'writing', title: 'Writing & content' },
      { id: 'customer', title: 'Customer support' },
      { id: 'ops', title: 'Operations & back-office' },
      { id: 'sales', title: 'Sales & marketing' },
      { id: 'verdict', title: 'What actually matters' }
    ],
    content: `
      <h2 id="writing">Writing & content</h2>
      <p>
        <strong>ChatGPT</strong>, <strong>Claude</strong>, and <strong>Grammarly</strong> cover 80% of
        day-to-day writing needs. Pair them with <strong>Descript</strong> for video and podcast
        editing — the "cut the ums" feature alone saves hours.
      </p>

      <h2 id="customer">Customer support</h2>
      <p>
        <strong>Intercom Fin</strong> and <strong>Zendesk AI Copilot</strong> deflect 30–50% of
        common tickets at a fraction of the cost of adding headcount. Only deploy once your help
        center is clean — garbage in, garbage out.
      </p>

      <h2 id="ops">Operations & back-office</h2>
      <p>
        <strong>Zapier's Zaps with AI</strong> and <strong>Make.com</strong> connect your stack
        without code. For finance, <strong>Puzzle.io</strong> reconciles books automatically. For
        hiring, <strong>Ashby AI</strong> drafts job descriptions and scores candidates.
      </p>

      <h2 id="sales">Sales & marketing</h2>
      <p>
        <strong>Clay</strong> for prospecting data, <strong>Apollo</strong> for outbound, and
        <strong>Gong</strong> (enterprise) or <strong>Fireflies</strong> (SMB) for call intelligence.
        The common thread: tools that write less but give reps more signal.
      </p>

      <h2 id="verdict">What actually matters</h2>
      <p>
        The winning pattern isn't "one AI to rule them all." It's 3–5 specialized AI tools wired into
        the workflows where a human was already struggling. Start narrow, measure, expand.
      </p>
    `
  },
  {
    slug: 'best-software-remote-teams-2025-stack',
    title: 'Best Software for Remote Teams: A Complete 2025 Stack Guide',
    excerpt:
      'The minimum viable remote-work stack — communication, collaboration, HR, and security — with picks at every budget and team size.',
    category: 'Business Growth',
    date: '2025-08-15',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 13,
    image: thumb('best-software-remote-teams-2025-stack'),
    tags: ['Remote Work', 'Software Stack', 'Productivity', 'Collaboration'],
    toc: [
      { id: 'communication', title: 'Communication' },
      { id: 'collab', title: 'Collaboration & docs' },
      { id: 'pm', title: 'Project management' },
      { id: 'people', title: 'People ops & HR' },
      { id: 'security', title: 'Security essentials' }
    ],
    content: `
      <h2 id="communication">Communication</h2>
      <p>
        One chat tool (Slack or Teams), one video tool (Zoom or Google Meet), and a dedicated async
        long-form channel (Loom or Tella). Stop using Slack for deep work — it's a synchronous tool
        dressed up as async.
      </p>

      <h2 id="collab">Collaboration & docs</h2>
      <p>
        Google Workspace or Microsoft 365 for core productivity. Notion, Confluence, or Almanac for
        structured knowledge. Figma for design and cross-team collaboration on visual artifacts.
      </p>

      <h2 id="pm">Project management</h2>
      <p>
        Linear for product teams, Asana or ClickUp for cross-functional, Monday for ops-heavy work.
        Whatever you pick — use it consistently. The #1 mistake is running two PM tools at once.
      </p>

      <h2 id="people">People ops & HR</h2>
      <p>
        Rippling, Deel, or Gusto for global payroll and HRIS. Lattice or 15Five for performance and
        1:1s. Donut or Pyn for culture and onboarding rituals.
      </p>

      <h2 id="security">Security essentials</h2>
      <p>
        A password manager (1Password or Bitwarden), SSO wherever possible (Okta, JumpCloud), MDM
        for devices (Kandji, Jamf), and a clear incident-response runbook. Do these four things and
        you're ahead of 90% of remote companies.
      </p>
    `
  },
  {
    slug: 'free-vs-paid-business-software-when-upgrade',
    title: 'Free vs Paid Business Software: When to Actually Upgrade',
    excerpt:
      'A practical framework for deciding when free plans stop earning their keep — with an ROI checklist and six common upgrade triggers.',
    category: 'Software Selection',
    date: '2025-08-14',
    author: 'SaaSWorld Editorial',
    authorTitle: 'Research Desk',
    readMinutes: 9,
    image: thumb('free-vs-paid-business-software-when-upgrade'),
    tags: ['Software Selection', 'ROI', 'Pricing', 'Budget'],
    toc: [
      { id: 'triggers', title: 'Six upgrade triggers' },
      { id: 'roi', title: 'A simple ROI check' },
      { id: 'mistakes', title: 'Common mistakes' },
      { id: 'verdict', title: 'The bottom line' }
    ],
    content: `
      <h2 id="triggers">Six upgrade triggers</h2>
      <ol>
        <li>You're hitting a hard cap (contacts, storage, seats).</li>
        <li>You're paying in workarounds — duplicate logins, manual exports, side tools.</li>
        <li>Security or compliance needs outgrow what the free plan offers.</li>
        <li>You need SSO or audit logs for SOC 2 or ISO 27001.</li>
        <li>Support SLAs matter — downtime hurts revenue.</li>
        <li>You've bought the same feature twice from different vendors.</li>
      </ol>

      <h2 id="roi">A simple ROI check</h2>
      <p>
        For every prospective upgrade, ask: "What's the hourly cost of the workaround, and how many
        hours per month does it consume?" If that number exceeds the paid plan price — upgrade.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <p>
        Buyers over-buy by choosing the Business or Enterprise tier when Pro would do. Others
        over-stay on free — losing more in productivity than a paid seat would cost. Both are
        expensive; the paid-plan mistake is just louder.
      </p>

      <h2 id="verdict">The bottom line</h2>
      <p>
        Upgrade when the workaround outruns the price. Downgrade or churn when a paid plan becomes
        a budget line nobody defends. Audit quarterly, not annually.
      </p>
    `
  }
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug)
  if (!current) return blogPosts.slice(0, limit)
  // same category first, then the rest
  const same = blogPosts.filter((p) => p.slug !== slug && p.category === current.category)
  const others = blogPosts.filter((p) => p.slug !== slug && p.category !== current.category)
  return [...same, ...others].slice(0, limit)
}

export function getAdjacentPosts(slug: string): { prev?: BlogPost; next?: BlogPost } {
  const i = blogPosts.findIndex((p) => p.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? blogPosts[i - 1] : undefined,
    next: i < blogPosts.length - 1 ? blogPosts[i + 1] : undefined
  }
}
