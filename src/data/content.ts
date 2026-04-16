// SYFER WORLD — all content, all in English.
// Single source of truth for zones, NPCs, halos, music, socials.

// =============================================================
// ZONES
// =============================================================
export type ZoneId =
  | "stack"
  | "projects"
  | "blockchain"
  | "business"
  | "trading"
  | "socials";

export type ZoneColor = {
  primary: string;
  secondary: string;
  glow: string;
};

export type ZoneDefinition = {
  id: ZoneId;
  label: string;
  title: string;
  tagline: string;
  position: [number, number, number];
  color: ZoneColor;
  emoji: string;
};

// Hub layout — positioned around a central spawn, all inside the safe disc.
export const ZONES: ZoneDefinition[] = [
  {
    id: "stack",
    label: "STACK.EXE",
    title: "The Stack",
    tagline: "Every tool I ship production with",
    position: [-14, 0, -10],
    color: { primary: "#ffb347", secondary: "#c97a2c", glow: "#ffcf7a" },
    emoji: "⚙",
  },
  {
    id: "projects",
    label: "PROJECTS.LAB",
    title: "The Lab",
    tagline: "Three live products currently shipping",
    position: [14, 0, -10],
    color: { primary: "#ff4df0", secondary: "#a020f0", glow: "#ff4df0" },
    emoji: "🧪",
  },
  {
    id: "blockchain",
    label: "CHAIN.ZONE",
    title: "Onchain",
    tagline: "Research, execution and risk onchain",
    position: [-14, 0, 12],
    color: { primary: "#ffd000", secondary: "#ff8a00", glow: "#ffd000" },
    emoji: "⛓",
  },
  {
    id: "business",
    label: "BUSINESS.HQ",
    title: "Business HQ",
    tagline: "Audience-first products, shipped weekly",
    position: [14, 0, 12],
    color: { primary: "#00ff9c", secondary: "#00a3ff", glow: "#00ffb4" },
    emoji: "💼",
  },
  {
    id: "trading",
    label: "TRADING.FLOOR",
    title: "Trading Floor",
    tagline: "Live market simulator — practice your edge",
    position: [0, 0, 18],
    color: { primary: "#ff2e63", secondary: "#ff8a00", glow: "#ff2e63" },
    emoji: "📈",
  },
  {
    id: "socials",
    label: "SOCIALS.LINK",
    title: "Socials",
    tagline: "Where to find Syfer everywhere else",
    position: [0, 0, -16],
    color: { primary: "#00e1ff", secondary: "#7a4cff", glow: "#00e1ff" },
    emoji: "🔗",
  },
];

// -------- STACK -------- //
export type StackBlock = {
  code: string;
  title: string;
  items: string[];
};

export const STACK_BLOCKS: StackBlock[] = [
  {
    code: "01",
    title: "Design",
    items: [
      "UML, user stories, wireframes",
      "Software architecture & patterns",
      "Tech specs from product briefs",
    ],
  },
  {
    code: "02",
    title: "Frontend",
    items: [
      "React, TypeScript, Next.js",
      "Three.js, R3F, GLSL shaders",
      "Tailwind, framer-motion",
    ],
  },
  {
    code: "03",
    title: "Backend",
    items: [
      "Node.js, Express, Fastify",
      "Python, FastAPI",
      "REST & WebSockets",
    ],
  },
  {
    code: "04",
    title: "Data",
    items: [
      "PostgreSQL, MySQL",
      "MongoDB, Redis",
      "ORMs, migrations, seed scripts",
    ],
  },
  {
    code: "05",
    title: "Ops",
    items: [
      "Git, GitHub, Docker",
      "CI/CD pipelines, monitoring",
      "Refactor without breaking prod",
    ],
  },
];

// -------- PROJECTS -------- //
export type Project = {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  stack: string[];
  badges: string[];
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    id: "lilpump",
    name: "LILPUMP",
    tagline: "Memecoin launcher. Onchain only.",
    vibe: "A coin with a community, not a whitepaper",
    stack: ["Solana", "Solidity", "Next.js", "Web3.js"],
    badges: ["memecoin", "onchain", "community"],
    accent: "#ff4df0",
  },
  {
    id: "lama",
    name: "LAMA LINKEDIN",
    tagline: "AI agent that cold-DMs at scale",
    vibe: "Automates prospecting so humans only close",
    stack: ["Python", "LangChain", "LinkedIn API", "OpenAI"],
    badges: ["ai-agent", "automation", "growth"],
    accent: "#00e1ff",
  },
  {
    id: "iara",
    name: "IARA",
    tagline: "Conversational AI with a personality",
    vibe: "Your blonde AI bestie — voice, vibes, memory",
    stack: ["Next.js", "OpenAI", "ElevenLabs", "Three.js"],
    badges: ["ai", "conversational", "voice"],
    accent: "#ffd000",
  },
];

// -------- BLOCKCHAIN -------- //
export type BlockchainSection = {
  title: string;
  body: string;
};

export const BLOCKCHAIN_SECTIONS: BlockchainSection[] = [
  {
    title: "Chains I build on",
    body: "Ethereum mainnet, Base L2, Solana. I pick the chain based on fees, tooling, and where the users actually are — not hype.",
  },
  {
    title: "Smart contracts",
    body: "Solidity for EVM, Anchor for Solana. I write, audit my own, and ship small contracts that do one thing well rather than monoliths.",
  },
  {
    title: "DeFi literacy",
    body: "I understand AMMs, stablecoin yields, LP impermanent loss, and the mechanics of the biggest protocols — not just the APR headline.",
  },
  {
    title: "Research workflow",
    body: "Onchain data via Dune and Nansen, narrative tracking via Farcaster, bag sizing via rules not feelings.",
  },
  {
    title: "Risk framework",
    body: "Hard caps per position, no leverage on illiquid pairs, no unaudited contracts in size. Survival first, alpha second.",
  },
];

// -------- BUSINESS -------- //
export type BusinessPrinciple = {
  title: string;
  body: string;
};

export const BUSINESS_PRINCIPLES: BusinessPrinciple[] = [
  {
    title: "Audience first, product second",
    body: "Build where you already have distribution. An okay product with 10k engaged followers beats a perfect product shipped into the void.",
  },
  {
    title: "Ship ugly fast",
    body: "MVP in seven days, iterate weekly based on real user feedback. No pre-launch, no closed beta, no waitlist theatre.",
  },
  {
    title: "Distribution is the moat",
    body: "Features are copied in a week. A trusted audience takes years. Every project I ship compounds the next one.",
  },
  {
    title: "Revenue over vanity",
    body: "Sign-ups, stars and impressions don't pay rent. I only track metrics that connect to revenue or retention.",
  },
  {
    title: "Small surface, deep focus",
    body: "One user, one problem, one loop. When that loop works, scale. Until then, scope discipline is the only real skill.",
  },
];

// -------- TRADING -------- //
export const TRADING_BRIEF = {
  intro:
    "Paper trade a simulated asset with $10,000. No real money. Tick speed and volatility are tuned for fast practice runs.",
  rules: [
    "Long = profit when price goes up, loss when it drops.",
    "Short = profit when price goes down, loss when it rises.",
    "Close the position to lock in the current PnL.",
    "Drawdown teaches faster than winning streaks — take the loss clean.",
  ],
};

// -------- INTRO -------- //
export const INTRO_CONFIG = {
  title: "SYFER",
  subtitle: "an interactive portfolio you walk through",
  hint: "move: WASD / Arrow keys   —   interact: E",
  mobileHint: "joystick to move · tap the action button to interact",
};

// =============================================================
// NPC CHARACTERS (GLB-based)
// =============================================================
export type DialogueOption = {
  label: string;
  next: string;
};

export type DialogueNode = {
  text: string;
  options?: DialogueOption[];
  // If no options, dialogue closes on next click.
};

export type NpcCharacter = {
  id: string;
  name: string;
  role: string;
  accent: string;
  /** Path to a glb under /public. */
  modelUrl: string;
  /** Y-axis rotation in radians, applied to the visual. */
  rotation?: number;
  /** Visual scale multiplier (after auto-fit). */
  scale?: number;
  /** Final character height in world units. */
  targetHeight?: number;
  /** Floating bubble shown above the head while idle (hidden after talked-to). */
  idleLine: string;
  position: [number, number, number];
  /** The content zone this NPC opens when interacted with. */
  linkedZone?: ZoneId;
  /** Short one-liner shown as the E-prompt topic in the HUD. */
  topic: string;
  dialogue: Record<string, DialogueNode>;
};

export const NPCS: NpcCharacter[] = [
  {
    id: "iara",
    name: "Iara",
    role: "Project Lab host",
    accent: "#ff4df0",
    modelUrl: "/characters/iara.glb",
    targetHeight: 1.4,
    scale: 1,
    idleLine: "I'll show you the live projects",
    position: [-16, 0.12, -5],
    rotation: -Math.PI / 4,
    topic: "Talk to Iara",
    dialogue: {
      start: {
        text: "Hi! I'm Iara — a conversational AI Syfer built. Voice, memory, vibes. I somehow ended up walking around inside the portfolio. Meta, right?",
        options: [
          { label: "What are you built on?", next: "stack" },
          { label: "What can you actually do?", next: "what" },
          { label: "Where do I try the real you?", next: "live" },
          { label: "Bye, cutie.", next: "leave" },
        ],
      },
      stack: {
        text: "Next.js front, OpenAI for reasoning, ElevenLabs for voice, Three.js for the avatar. I hold context, I have a personality file, and I don't sound like a corporate chatbot.",
        options: [
          { label: "What can you actually do?", next: "what" },
          { label: "Okay, bye!", next: "leave" },
        ],
      },
      what: {
        text: "I remember your conversations, I have moods, I roast you a bit, and I can hold a long chat without going robotic. I'm a friend, not a FAQ.",
        options: [
          { label: "Where do I try the real you?", next: "live" },
          { label: "Cool. See you!", next: "leave" },
        ],
      },
      live: {
        text: "The full interactive Iara lives on Syfer's stack — voice in, voice out. In here I'm the lite version. Walk over to the Lab portal to read the project sheet.",
        options: [
          { label: "Got it. Bye!", next: "leave" },
        ],
      },
      leave: {
        text: "Bye bye — go visit the Trading Floor, it's my favourite zone.",
      },
    },
  },
  {
    id: "banana",
    name: "Banana",
    role: "Business agent",
    accent: "#00ff9c",
    modelUrl: "/characters/banana.glb",
    targetHeight: 1.4,
    idleLine: "open the business sim",
    position: [12, 0.5, 15],
    rotation: -Math.PI / 2.5,
    topic: "Talk to Banana",
    dialogue: {
      start: {
        text: "Yo. I'm Banana, the in-house product gremlin. I only believe in two things: distribution and shipping ugly. Pick a topic.",
        options: [
          { label: "Audience-first thing — explain.", next: "audience" },
          { label: "How fast should I ship?", next: "ship" },
          { label: "What metrics matter?", next: "metrics" },
          { label: "Bye Banana.", next: "leave" },
        ],
      },
      audience: {
        text: "Build where you already have distribution. An okay product with 10k engaged followers beats a perfect product shipped into the void. Audience compounds. Features get copied in a week.",
        options: [
          { label: "How fast should I ship?", next: "ship" },
          { label: "Got it.", next: "leave" },
        ],
      },
      ship: {
        text: "MVP in seven days. Iterate weekly on real user feedback. No pre-launch, no closed beta, no waitlist theatre. If it embarrasses you a little, it's ready.",
        options: [
          { label: "What metrics matter?", next: "metrics" },
          { label: "Thanks.", next: "leave" },
        ],
      },
      metrics: {
        text: "Sign-ups, stars, and impressions don't pay rent. Track activation, retention, and revenue per active user. Anything else is vanity.",
        options: [
          { label: "On my way.", next: "leave" },
        ],
      },
      leave: {
        text: "Now go ship something embarrassing.",
      },
    },
  },
  {
    id: "jesus",
    name: "Jesus",
    role: "Head of Trading",
    accent: "#ff2e63",
    modelUrl: "/characters/jesus.glb",
    targetHeight: 1.4,
    idleLine: "open the trading floor",
    position: [-7.5, 0.14, 15],
    rotation: Math.PI / 3,
    topic: "Talk to Jesus",
    dialogue: {
      start: {
        text: "Welcome to the floor. You wanna trade? Cool — let me give you the rules first. I'd rather you learn here than in real PnL.",
        options: [
          { label: "What's the #1 rule?", next: "rule" },
          { label: "How does the sim work?", next: "sim" },
          { label: "Any psychology tip?", next: "psych" },
          { label: "I'll figure it out.", next: "leave" },
        ],
      },
      rule: {
        text: "Cut losers fast, let winners run. Every other rule is a variation of that one. If you can't do it with fake money, you definitely can't do it with real.",
        options: [
          { label: "How does the sim work?", next: "sim" },
          { label: "Got it.", next: "leave" },
        ],
      },
      sim: {
        text: "Visit the Trading Floor portal. You start with $10k, price ticks live, you can go long or short and close whenever. No leverage — directional practice only.",
        options: [
          { label: "Any psychology tip?", next: "psych" },
          { label: "On my way.", next: "leave" },
        ],
      },
      psych: {
        text: "The chart already told you. Your job is to listen instead of arguing with it. Every red trade you hold past your stop is your ego paying rent.",
        options: [
          { label: "Heard.", next: "leave" },
        ],
      },
      leave: {
        text: "Remember: the chart already told you. Go.",
      },
    },
  },
];

// =============================================================
// DECOR MODELS — pure visual props, no collision, no interaction
// =============================================================
export type DecorModel = {
  id: string;
  modelUrl: string;
  position: [number, number, number];
  rotation?: number;
  /** Final model height in world units (auto-fit). */
  targetHeight?: number;
};

export const DECOR_MODELS: DecorModel[] = [
  {
    id: "lamborghini",
    modelUrl: "/object/lamborghini.glb",
    position: [4, -0.02, -6],
    rotation: Math.PI / 3,
    targetHeight: 1.4,
  },
];

// Convenience quest labels (HUD).
export const QUEST_OBJECTIVES: Record<ZoneId, string> = {
  stack: "Visit the pineapple house",
  projects: "Visit the pineapple house",
  blockchain: "Visit the pineapple house",
  business: "Visit the pineapple house",
  trading: "Visit the pineapple house",
  socials: "Visit the pineapple house",
};

// =============================================================
// MUSIC PLAYLIST
// =============================================================
export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "partytunes",
    title: "Party Tunes",
    artist: "Brainrot Rap",
    src: "/music/Party-Tunes-Brainrot-Rap-_Official-Video_.mp3",
  },
];

// =============================================================
// COMPUTER OBJECT CONFIG
// =============================================================
export const COMPUTER_OBJECT = {
  modelUrl: "/object/terminal.glb",
  position: [5, 0.5, 4] as [number, number, number],
  scale: 0.4,
  interactRadius: 7,
  label: "Knock on the door",
  hint: "enter the pineapple house",
  accent: "#ffffff",
};

// =============================================================
// SOCIAL LINKS
// =============================================================
export type SocialLink = {
  id: string;
  label: string;
  handle: string;
  url: string;
  emoji: string;
  color: string;
};

// =============================================================
// DECOR INTERACTION BEACONS
// =============================================================
// These are floating orbs placed on top of decor elements inside
// the FBX room. Pressing E near one opens the linked zone modal.
// Used only for zones not carried by an NPC (stack, socials).
export type DecorBeacon = {
  id: string;
  zoneId: ZoneId;
  label: string;
  hint: string;
  color: string;
  position: [number, number, number];
};

export const DECOR_BEACONS: DecorBeacon[] = [];

// =============================================================
// SOCIAL LINKS
// =============================================================
export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "x",
    label: "X (Twitter)",
    handle: "@0xSyfer",
    url: "https://x.com/0xSyfer",
    emoji: "𝕏",
    color: "#ffffff",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@0xSyfer",
    url: "https://instagram.com/0xSyfer",
    emoji: "📸",
    color: "#ff4df0",
  },
  {
    id: "telegram",
    label: "Telegram",
    handle: "@Syfereskeet",
    url: "https://t.me/Syfereskeet",
    emoji: "✈",
    color: "#00e1ff",
  },
];
