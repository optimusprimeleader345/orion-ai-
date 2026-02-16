export interface SimulationStep {
    type: 'thought' | 'action' | 'message';
    content: string;
    details?: string; // For collapsible thought chains
    citation?: { title: string; url: string }[];
    delay?: number;
}

export interface MockScenario {
    keywords: string[];
    mode?: 'standard' | 'research' | 'coding' | 'creative';
    steps: SimulationStep[];
}

export const MOCK_SCENARIOS: MockScenario[] = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        steps: [
            {
                type: 'message',
                content: "Hello! I am Sentinel AI. I am ready to assist with deep research, complex coding tasks, or strategic analysis. Select a mode from the sidebar or just ask a question to get started.",
                delay: 500
            }
        ]
    },
    {
        keywords: ['quantum', 'computing', 'breakthrough', 'research'],
        mode: 'research',
        steps: [
            {
                type: 'thought',
                content: "Identifying key themes in query...",
                details: "Detected topics: Quantum Computing, Recent Breakthroughs. Activating search module.",
                delay: 1000
            },
            {
                type: 'action',
                content: "Searching global database for 'Quantum Computing Breakthroughs 2025'...",
                delay: 2000
            },
            {
                type: 'thought',
                content: "Analyzing search results...",
                details: "Found 14,000 relevant articles. Filtering for high-impact peer-reviewed papers.",
                delay: 1500
            },
            {
                type: 'message',
                content: `### ⚛️ Quantum Supremacy Achievement
Recent developments have pushed the boundaries of quantum coherence.

1.  **Stable Qubits**: MIT researchers have demonstrated a new "Topological Qubit" architecture that remains stable for over 10ms, a 1000x improvement.
2.  **Error Correction**: Google's Quantum AI lab has successfully implemented a logical qubit with a lower error rate than its constituent physical qubits.

These advancements suggest we are nearing the threshold for fault-tolerant quantum computing.`,
                citation: [
                    { title: "MIT Quantum Lab Reports", url: "https://mit.edu/quantum" },
                    { title: "Nature: Topological Qubits", url: "https://nature.com/articles/s41586-025" }
                ],
                delay: 1000
            }
        ]
    },
    {
        keywords: ['fix', 'bug', 'loop', 'error', 'debug'],
        mode: 'coding',
        steps: [
            {
                type: 'thought',
                content: "Analyzing code structure...",
                details: "Scanning for syntax errors, logical flaws, and performance bottlenecks.",
                delay: 1200
            },
            {
                type: 'action',
                content: "Running static analysis...",
                delay: 1500
            },
            {
                type: 'thought',
                content: "Issue detected: Infinite Recursion",
                details: "The base case in the recursive function `processData` is unreachable under specific conditions.",
                delay: 1000
            },
            {
                type: 'message',
                content: `I've identified the issue. The recursion lacks a proper termination condition for empty lists.

**Fix:**
Add a base case check at the start of the function.

\`\`\`python
def process_data(items):
    # Added base case
    if not items:
        return 0
        
    current = items[0]
    # ... rest of logic
    return current + process_data(items[1:])
\`\`\`

This ensures the stack unwinds correctly when the list is exhausted.`,
                delay: 800
            }
        ]
    },
    {
        keywords: ['who are you', 'identity'],
        steps: [
            {
                type: 'thought',
                content: "Retrieving identity protocols...",
                delay: 800
            },
            {
                type: 'message',
                content: "I am **Sentinel AI**, a specialized artificial intelligence designed to optimize workflows, enhance decision-making, and provide deep technical support. I operate within this Universal Workspace to serve as your co-pilot in all digital endeavors.",
                delay: 500
            }
        ]
    }
];

export const DEFAULT_SCENARIO: MockScenario = {
    keywords: [],
    steps: [
        {
            type: 'thought',
            content: "Analyzing input intent...",
            details: "Input does not match pre-cached scenarios. falling back to general generative model.",
            delay: 1500
        },
        {
            type: 'message',
            content: "I received your request. Using my advanced simulation capabilities, I can simulate **Deep Research**, **Coding**, and **Strategic Analysis**. \n\nTry asking me about **Quantum Computing** or to **Fix a bug** to see these modes in action.",
            delay: 500
        }
    ]
};
