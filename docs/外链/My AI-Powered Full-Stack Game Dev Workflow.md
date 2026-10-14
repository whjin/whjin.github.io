# My AI-Powered Workflow for Full-Stack + Game Development

I wear a lot of hats. In a typical week, I might:
- Build a full-stack web app (React + Node + PostgreSQL)
- Write some Verilog for an FPGA project
- Prototype a small browser game
- Tweak my personal blog

That's a wide range of skills, and keeping all of them sharp takes a lot of context switching. AI tools have completely changed how I work.

This isn't another "10 AI tools you need to know" listicle. This is exactly how I use AI in my daily workflow, what works, what doesn't, and how I've adapted over the past year.

---

## The Problem: Context Switching

As a solo developer who does everything, my biggest time sink isn't writing code — it's switching contexts.

One minute I'm thinking about React hooks state management. The next I'm debugging a SQL query. Then I'm wondering why my game physics feels floaty. Then I'm reading Verilog timing reports.

Each context switch costs 10-15 minutes of ramp-up time. Multiply that by 20 switches a day, and you've lost half your day.

AI has helped me reduce this dramatically. Here's how.

---

## 1. Full-Stack Web Development

### The Stack

My typical stack:
- Frontend: React / Vue + TypeScript
- Backend: Node.js / Express
- Database: PostgreSQL
- Deployment: Vercel / GitHub Pages

### How I Use AI

**Frontend**:
- Generate component boilerplate
- Debug CSS layout issues (yes, even AI still struggles with centering divs)
- Explain unfamiliar libraries

**Backend**:
- Write Express route handlers
- Generate SQL queries from natural language
- Debug async/await issues

**Database**:
- Schema design feedback
- Query optimization suggestions
- Migration scripts

### What Works Well

I once spent 30 minutes debugging a PostgreSQL N+1 query problem. Pasted the code into Claude, and it spotted the issue in 30 seconds. That's the kind of thing AI is great at — pattern matching across code you've seen a hundred times.

### What Doesn't Work

Complex system design. AI will happily write you a microservices architecture that "scales to millions of users," but it doesn't know that your app only has 100 users. You still need to make the big architecture calls yourself.

---

## 2. Game Development

I build small browser games — usually with Canvas or Phaser.js. Nothing fancy, just weekend projects.

### How I Use AI

**Physics**:
- "How do I implement simple gravity and collision detection in Canvas?"
- "Why does my character feel floaty? Here's my movement code..."

**Game loops**:
- Generate the game loop structure (requestAnimationFrame, delta time)
- Input handling (keyboard, mouse, touch)

**Polish**:
- Particle effects
- Screen shake
- Sound effect integration

### Real Example

Last month I built a small breakout clone. The ball physics felt wrong — it was either too bouncy or not bouncy enough.

I pasted my collision detection code into Claude, and it pointed out that I wasn't properly reflecting the ball's velocity vector off the paddle. I was just flipping the Y velocity, which made the ball always bounce straight up regardless of where it hit the paddle.

It explained how to calculate the reflection angle based on where the ball hits the paddle. Fixed it in 5 minutes.

That's the kind of thing that would've taken me hours of trial and error before AI.

### What Doesn't Work

Game feel. AI can write the physics, but it can't tell you if the game "feels" right. That's something you have to playtest yourself.

---

## 3. FPGA / Hardware

I already wrote a separate article about AI and Verilog, so I'll keep this brief.

### How I Use AI

- Write standard building blocks (UART, SPI, PWM)
- Generate testbenches
- Debug obvious bugs
- Explain unfamiliar Verilog code

### The Rule

AI writes the boilerplate, I do the architecture and timing closure.

---

## 4. The Tool Stack

Here's exactly what I use, and when:

| Tool | When I Use It |
|---|---|
| **Cursor** | Daily driver. Inline autocomplete, chat sidebar. |
| **Claude (web)** | For complex debugging, long code explanations. |
| **GitHub Copilot** | When I'm in VS Code (not Cursor). |
| **ChatGPT** | Quick questions, "how do I do X in Y?" |

I don't use all of them every day. Cursor + Claude cover 90% of my needs.

---

## The Workflow: Step by Step

Here's what a typical day looks like:

### Morning: Planning
- I open my notes and figure out what I'm working on today
- No AI involved — planning is still human territory

### Mid-Morning: Implementation
- Open Cursor, start coding
- AI autocomplete handles boilerplate
- When I get stuck, I open the chat sidebar and ask

### Afternoon: Debugging
- Something's broken
- Paste the error + relevant code into Claude
- It suggests a fix, I try it
- Iterate

### Evening: Review
- Go through what I wrote
- AI-assisted review: "Does this code look okay?"
- Clean up, commit

---

## The Productivity Math

Before AI:
- Writing a new CRUD feature: ~4 hours
- Debugging a tricky bug: ~2 hours
- Writing a testbench: ~1 hour
- Total: ~7 hours of focused work

With AI:
- Writing a new CRUD feature: ~2 hours
- Debugging a tricky bug: ~1 hour
- Writing a testbench: ~20 minutes
- Total: ~3.5 hours

Roughly 2x faster. Not 10x, not "AI replaced me" — just genuinely twice as productive.

The biggest gain isn't typing speed — it's reducing context switching and mental overhead.

---

## What I Still Do Manually

AI doesn't do these things for me, and probably never will:

1. **Architecture decisions**: Should I use REST or GraphQL? SQL or NoSQL? AI can give pros and cons, but I make the call.
2. **Product judgment**: What features to build, what to cut. AI doesn't know your users.
3. **Game feel**: Does the game feel fun? AI can't playtest it for you.
4. **Timing closure**: FPGA design's hardest problem is still a human job.
5. **Code review**: AI is too nice. It'll approve whatever you give it.

---

## Tips for Getting the Most Out of AI

### 1. Be Specific

Bad: "Write a game."
Good: "Write a simple breakout game in HTML5 Canvas. Ball bounces off paddle and bricks. Score counter. Game over when ball hits bottom."

The more specific you are, the better the output.

### 2. Iterate

First output is never perfect. Treat it like a junior developer's work — review it, give feedback, iterate.

### 3. Know When to Stop

If AI has tried 3 times and still can't solve your bug, it's probably a nuanced problem that needs your own debugging skills. Don't waste hours going back and forth.

### 4. Don't Blindly Trust

AI hallucinates. It'll confidently write code that looks right but doesn't work. Always test, always review.

---

## The Bottom Line

AI hasn't replaced me as a developer. But it has made me significantly more productive — especially across multiple domains.

The biggest win isn't "AI writes my code for me." It's that I can switch between web dev, game dev, and FPGA work without losing hours of context. AI fills in the gaps when I'm rusty on something I don't do every day.

If you're a multi-disciplinary developer like me, AI is a force multiplier. It lets you do more things, in more domains, without burning out.

---

*This was based on real daily work across [wuhuajin.com](https://wuhuajin.com) and various side projects. If you're also a multi-disciplinary developer, I'd love to hear how you use AI tools.*
