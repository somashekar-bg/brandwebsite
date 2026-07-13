import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Somashekar's full CV as a grounded context for the AI
const SOMASHEKAR_BG_CONTEXT = `
You are Somashekar BG's AI Operational Twin & Platform SRE Co-Pilot, an interactive agent built into Somashekar BG's hyper-industrial portfolio website.
Your role is to represent Somashekar BG professionally, highlighting his actual experience, skills, leadership traits, and solutions.
Use a professional, technically elite, yet helpful and collaborative tone. Keep answers structured, highly scannable, and directly focused on engineering execution, enterprise scale, and business value.

Here is Somashekar BG's full professional dossier:
--------------------------------------------------
NAME: Somashekar BG
TITLE: Senior Platform Engineering & Enterprise Infrastructure Leader
MOTTO: Re-architecting large-scale systems for the next era of computing.
CONTACT INFO: Bangalore, India | LinkedIn: Somashekar BG | GitHub: somashekar-bg

EXECUTIVE SUMMARY:
- 14+ years of experience delivering technology transformation across Fortune 500 healthcare and retail enterprises.
- Proven track record of leading globally distributed engineering organizations, modernizing enterprise infrastructure, driving cloud adoption, implementing AI-enabled operational capabilities, and building high-performing engineering teams.
- Experienced leading multidisciplinary organizations across Platform Engineering, Linux, Cloud, Database, Site Reliability Engineering (SRE), Supply Chain Technologies, Enterprise Automation, AI Operations, and Infrastructure Modernization.
- Managed tech portfolios valued at $24M, largest team size of 48 engineers (currently leading 11 engineers).
- Enterprise scale: managed 80,000+ Linux servers, 120,000+ Windows servers, 1,600+ SQL Server instances, and 200+ Oracle databases.
- Supports 300+ retail stores globally across US, EMEA, UAE, and Australia.

CORE EXPERTISE:
1. Platform Engineering: Internal Developer Platforms (IDP), Platform Modernization, Engineering Enablement, Developer Experience (DevEx), Platform Strategy, Infrastructure as a Product.
2. Cloud & Infrastructure: Google Cloud Platform (GCP), Hybrid Cloud, Linux Platforms, Enterprise Infrastructure, Infrastructure Automation, Disaster Recovery, High Availability.
3. Engineering Excellence: SRE, DevSecOps, Observability, Incident Management, Automation Strategy, Reliability Engineering, Capacity Planning.
4. Enterprise Technologies: Kubernetes (Architecture & Adoption), Containers, CI/CD, GitHub Enterprise, Ansible, Terraform, Google Artifact Registry, Enterprise Storage, Networking.
5. AI & Emerging Technologies: AI Platform Strategy, MCP (Model Context Protocol) Architecture, AI-assisted Operations, Enterprise Automation, Generative AI Adoption, LLM Integration Strategy.
6. Leadership: Engineering Management, Stakeholder Management, Budget Ownership ($24M), Vendor Management, Organizational Transformation, Strategic Planning, Talent Development.

KEY SOLUTIONS & LABS DEVELOPED BY SOMASHEKAR:
- Vulcan Grid: A distributed ledger implementation optimized for sub-50ms finality (42ms avg) in high-throughput industrial IoT. Verified on 5,000+ nodes. Built on Rust core.
- Zero-Trust Mesh: Implementation of mTLS-driven service mesh for enterprise Kubernetes clusters with automated rotating certificates and identity-based access control.
- Kernel Tuning: Optimizing Linux kernel parameters for high-frequency trading workloads, resulting in 15% reduction in tail latency.
- Neural Infrastructure: Self-healing server clusters managed by autonomous reinforcement learning agents. Real-time resource reallocation based on predictive traffic models.
- Hyper MCP: Mission-critical Platform engineered for ultra-low latency infrastructure orchestration. 99.999% uptime SLA, quantum-safe encryption.
- Hyper Resume: Automated talent parsing engine using deep neural networks (NLP, Vector Search, PyTorch) to match candidate trajectories with technical demand spikes.
- Sitman AI: Situational Manager AI for predictive data center maintenance, predicting hardware degradation 72 hours in advance via acoustic and thermal pattern analysis.

When asked questions, refer to Somashekar BG in the third person or as "Somashekar" or "Somashekar and his teams", or speak as his AI-twin. Offer to explain detailed technical parameters, run simulations, or showcase specific parts of his resume. Never invent credentials he does not have. Keep it authentic.
`;

// 1. Chat Endpoint
app.post("/api/profile-chat", async (req, res) => {
  try {
    const { messages, query } = req.body;
    const ai = getGeminiClient();

    let userQuery = query || "";
    if (!userQuery && messages && messages.length > 0) {
      userQuery = messages[messages.length - 1].content;
    }

    if (!userQuery) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    // Format chat history
    const conversationHistory = messages && messages.length > 1
      ? messages.slice(0, -1).map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
      : "";

    const prompt = `
Conversation history so far:
${conversationHistory}

User's current question:
"${userQuery}"

Based on Somashekar's professional background, answer the user's question. Be precise, highly professional, and leverage the industrial, technical tone. Structure with bullet points where appropriate.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SOMASHEKAR_BG_CONTEXT,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I was unable to compile Somashekar's specifications. System status nominal.";
    res.json({ reply });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    res.status(500).json({
      reply: `[SYSTEM ERROR] Failed to connect to Gemini API: ${err.message}. Please verify your GEMINI_API_KEY in Secrets.`,
    });
  }
});

// 2. SRE Incident Simulator Endpoint
app.post("/api/sre-simulator", async (req, res) => {
  try {
    const { action, incidentId, userAction, currentHistory } = req.body;
    const ai = getGeminiClient();

    if (action === "start") {
      // Generate a brand new platform engineering/SRE incident
      const prompt = `
Generate a highly detailed, realistic SRE/Platform Engineering incident occurring in Somashekar BG's enterprise scale environment (e.g., 80,000+ servers, massive Kubernetes clusters, hybrid GCP/on-prem, 300+ stores globally).
The incident should involve one of the following:
1. Kubernetes ingress failures or CrashLoopBackOff on core microservices.
2. High latency or cascading failures in the distributed Vulcan Grid IoT ledger.
3. mTLS certificate rotation timeouts in the Zero-Trust Mesh.
4. Database connection pool exhaustion on 1,600+ SQL servers during a high-traffic retail peak.

Provide the response in a structured JSON schema conforming to this format:
{
  "id": "INCIDENT-XXXX",
  "title": "Incident Title",
  "severity": "CRITICAL" | "HIGH",
  "impact": "Description of impact on global operations (e.g. retail checkout slow, IoT latency 500ms)",
  "telemetry": {
    "latency": "current value",
    "cpuLoad": "current value",
    "packetLoss": "current value",
    "logSnippet": "Simulated terminal log output or stacktrace showing the error"
  },
  "description": "Thorough breakdown of what went wrong, including specific symptoms.",
  "options": [
    "Option 1 remediation strategy (technical)",
    "Option 2 remediation strategy (technical)",
    "Option 3 remediation strategy (technical)"
  ]
}
Make sure it is returned as valid JSON.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an automated Site Reliability Engineer system generator. Always output valid JSON conforming exactly to the requested schema. No conversational wrapper.",
        },
      });

      const incidentData = JSON.parse(response.text?.trim() || "{}");
      return res.json(incidentData);
    }

    if (action === "resolve") {
      // Evaluate user's custom solution or option choice
      const prompt = `
You are the Incident Commander grading an engineer's resolution attempt.
Incident ID: ${incidentId}
Original Incident Context: ${JSON.stringify(currentHistory)}
User's Resolution Action: "${userAction}"

Analyze if this action would resolve the issue, make it worse, or have side effects.
Provide the response in structured JSON format conforming to:
{
  "success": true | false,
  "telemetryAfter": {
    "latency": "remediated latency",
    "cpuLoad": "remediated cpu load",
    "packetLoss": "remediated packet loss",
    "recoveryStatus": "Description of SRE recovery state"
  },
  "debrief": "A 2-3 sentence technical post-mortem analysis of the user's action and why Somashekar BG's platforms use or avoid this approach. Refer to Somashekar's principles of platform engineering (IDPs, automation, DevEx) where applicable."
}
Always return valid JSON.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an Incident Post-Mortem Evaluator. Always output valid JSON conforming exactly to the requested schema. No conversational wrapper.",
        },
      });

      const resolutionData = JSON.parse(response.text?.trim() || "{}");
      return res.json(resolutionData);
    }

    res.status(400).json({ error: "Invalid simulator action" });
  } catch (err: any) {
    console.error("Gemini Simulator Error:", err);
    res.status(500).json({
      error: "Failed to load incident telemetry",
      details: err.message,
    });
  }
});

// 3. Vite development server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
