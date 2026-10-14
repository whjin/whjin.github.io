# Can AI Actually Write Verilog for FPGAs? My Real-World Test

As someone who does both full-stack web development and FPGA/Verilog programming, I was curious: can AI coding assistants handle hardware description languages?

Everyone's talking about AI writing JavaScript, Python, and Rust. But what about Verilog? VHDL? Can an LLM actually understand hardware parallelism, timing constraints, and FPGA-specific quirks?

I decided to put it to the test. Over the past month, I've been using AI tools (Claude, GPT-4, Cursor) on real FPGA projects. Here's what worked, what didn't, and whether AI is actually useful for hardware design.

---

## Why I Was Skeptical

I'm a self-taught FPGA developer. I know Verilog well enough to design working circuits, but I'm not a seasoned ASIC engineer. So I was hopeful that AI could help — but also skeptical.

Hardware description languages are fundamentally different from software:
- **Parallel execution**: Everything happens at once, not step by step
- **Timing matters**: A bug that only shows up at 100MHz might be invisible in simulation
- **Resource constraints**: FPGAs have fixed LUTs, flip-flops, and DSP blocks
- **Toolchain quirks**: Every FPGA vendor (Xilinx, Intel, Lattice) has its own weirdness

Could an LLM actually grok this?

---

## Test 1: Basic Modules

Let's start simple. I asked Claude to write a UART transmitter.

**Prompt**: "Write a Verilog module for a UART transmitter, 115200 baud, 8N1, 50MHz clock."

**Result**: It wrote a clean, well-structured UART transmitter. It had:
- A baud rate generator
- A shift register
- Start/stop bit logic
- Even added a parity bit option

Was it correct? Mostly. I had to tweak the baud rate divisor calculation (it used 50MHz / 115200 ≈ 434, which is right), but the structure was solid.

**Verdict**: ✅ Works well for standard building blocks. UART, SPI, I2C, PWM — all the common interfaces.

---

## Test 2: State Machines

Next, I asked for a more complex design: a SPI master with a configurable register file.

**Prompt**: "Write a Verilog SPI master module that can read/write to internal registers, 4-wire SPI, mode 0."

**Result**: The output was good. It had:
- Proper SPI mode 0 timing (CPOL=0, CPHA=0)
- A state machine for the SPI transaction
- An internal register bank
- Chip select handling

One thing it got wrong: it used a blocking assignment (`=`) in a sequential block where it should have used non-blocking (`<=`). This is a classic Verilog gotcha — the kind of thing that simulation might not catch, but synthesis will hate.

I caught it because I know what to look for. A beginner might not.

**Verdict**: ⚠️ Good structure, but watch for subtle Verilog mistakes.

---

## Test 3: Timing and Constraints

Here's where things get interesting. Timing closure is one of the hardest parts of FPGA design.

**Prompt**: "My design has a 100MHz clock and I'm getting setup time violations. How do I fix this?"

**Result**: It gave the standard advice:
- Add pipeline registers
- Retime logic
- Use FPGA's built-in RAM blocks
- Check for combinational loops

All good advice — but generic. It couldn't actually look at my specific timing report and tell me which path was the problem.

**Verdict**: ⚠️ Good theoretical advice, but can't analyze your specific timing report.

---

## Test 4: Debugging Existing Code

This is where I was most curious. Can AI help debug broken Verilog?

I took a working SPI module and introduced a bug: I swapped the MOSI and MISO signals.

**Prompt**: "My SPI receiver isn't working. The data I'm getting is all zeros. Here's my code: [pasted Verilog]"

**Result**: It read through the code, spotted the MISO/MOSI mix-up within seconds. It explained why it was wrong and how to fix it.

Impressive. But let's be honest — this was a simple bug. What about trickier ones?

I tried a more subtle bug: a metastability issue where I forgot to double-synchronize an asynchronous input.

**Prompt**: "I'm getting random bit errors on my UART RX line. The design works in simulation but fails on hardware."

**Result**: It suggested checking for metastability issues. It mentioned that asynchronous inputs need proper synchronization. But it didn't pinpoint the exact issue because it couldn't see my full design.

**Verdict**: ✅ Great for spotting obvious bugs. ⚠️ Harder for subtle timing/metastability issues.

---

## Test 5: FPGA-Specific Knowledge

What about FPGA vendor-specific stuff? Like Xilinx UltraRAM, or Intel DSP blocks?

**Prompt**: "Write a Verilog design that uses a Xilinx DSP48E2 block to implement a FIR filter."

**Result**: It wrote the structure, but the DSP48E2 instantiation was wrong. It used generic names instead of the actual Xilinx primitive names.

You'd need to know the exact primitive names, ports, and parameters — which AI doesn't always get right.

**Verdict**: ⚠️ Good for generic logic, but vendor-specific primitives need manual correction.

---

## What Actually Saves Me Time

After a month of using AI on FPGA projects, here's what actually saves time:

### 1. Boilerplate and Common Interfaces

UART, SPI, I2C, PWM, I2S — all the standard building blocks. AI writes these correctly 90% of the time, saving me hours of looking up reference code.

### 2. Testbenches

Writing testbenches is tedious. AI is surprisingly good at them. Ask it to "write a testbench for this UART module that sends 0x55 and 0xAA and checks the output" — it does it.

### 3. Explaining Existing Code

Staring at someone else's Verilog for hours? Paste it into Claude and ask "what does this do?" It's surprisingly good at reverse-engineering.

### 4. Debugging Obvious Bugs

Syntax errors, wrong port directions, missing `endmodule` — AI catches these instantly.

---

## What AI Still Sucks At

### 1. Timing Closure

This is the hard part of FPGA design. AI can't read your timing report and tell you exactly which path to fix. You still need to understand setup/hold time, clock skew, and retiming yourself.

### 2. Resource Optimization

"Can I fit this design into a Lattice iCE40 with 1280 LUTs?" AI can estimate, but it can't actually run synthesis and see the real resource usage.

### 3. Vendor-Specific Tooling

Xilinx Vivado, Intel Quartus, Lattice iCEcube2 — each has its own Tcl scripting, constraints format, and build flow. AI doesn't know the ins and outs of your specific toolchain.

### 4. Subtle Hardware Bugs

Metastability, race conditions, glitches — these are the bugs that don't show up in simulation but eat you alive on real hardware. AI won't catch these unless you explicitly point them out.

---

## My Workflow Now

Here's how I actually use AI for FPGA work:

1. **Design phase**: I sketch the block diagram myself. AI doesn't make architectural decisions for me.
2. **Implementation**: I ask AI to write the boilerplate modules (UART, SPI, etc.).
3. **Integration**: I wire everything together manually.
4. **Testbench**: AI writes the testbench.
5. **Debugging**: If simulation fails, I paste the code and ask AI for help.
6. **Synthesis**: I run the tools myself. AI doesn't touch the timing constraints.

AI is a copilot, not the pilot. It handles the tedious parts, I handle the architecture and the tricky bits.

---

## Should FPGA Developers Use AI?

**Yes, with caveations.**

AI is great for:
- Writing standard building blocks
- Generating testbenches
- Debugging obvious bugs
- Explaining unfamiliar code

AI is NOT good for:
- Architectural decisions
- Timing closure
- Vendor-specific optimization
- Subtle hardware bugs

Think of AI as a junior engineer. It can crank out working code for well-defined tasks, but you still need to review it carefully. And for the hard problems — timing, resources, architecture — you're still the one in charge.

---

## The Bottom Line

AI won't replace FPGA engineers anytime soon. Hardware design is too nuanced, too tied to specific hardware, too dependent on real-world measurement.

But AI will make FPGA developers more productive. The tedious boilerplate that used to take hours? Now it takes minutes. The time saved can go into the hard parts — architecture, optimization, testing — where it actually matters.

If you're an FPGA developer and you're not using AI yet, you're spending too much time writing UART and SPI modules from scratch.

---

*This was based on real FPGA development work on [wuhuajin.com](https://wuhuajin.com). If you're also doing FPGA + software development, I'd love to hear how you're using AI tools.*
