/**
 * Extended Footer Stats Extension
 *
 * Modifies the pi footer to show:
 * - Tokens per second (last request)
 * - Time to first token (last request)
 * - Cost of last request
 * In addition to the default footer content (git branch, model, extension statuses).
 */

import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ReadonlyFooterDataProvider } from "@earendil-works/pi-coding-agent";
import type { TUI, Theme } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

interface LastRequestStats {
  ttftMs: number | null;
  e2eMs: number | null;
  tokensPerSec: number | null;
  costTotal: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  model: string | null;
}

/** Running accumulator for usage across all turns in a single agent request. */
interface AccumulatedUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };
}

export default function (pi: ExtensionAPI) {
  let enabled = true;
  let agentStartTime: number | null = null;
  let firstTokenTime: number | null = null;
  let accumulated: AccumulatedUsage | null = null;
  let accumulatedModel: string | null = null;
  let lastStats: LastRequestStats = {
    ttftMs: null, e2eMs: null, tokensPerSec: null, costTotal: null,
    inputTokens: null, outputTokens: null, cacheReadTokens: null, cacheWriteTokens: null, model: null,
  };

  // --- Agent lifecycle: accumulates usage across all turns ---

  pi.on("agent_start", async () => {
    agentStartTime = performance.now();
    firstTokenTime = null;
    accumulated = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } };
    accumulatedModel = null;
  });

  pi.on("agent_end", async () => {
    if (agentStartTime == null || accumulated == null) return;
    const e2eMs = performance.now() - agentStartTime;
    const totalOutput = accumulated.output;

    lastStats = {
      ttftMs: firstTokenTime,
      e2eMs,
      tokensPerSec: totalOutput > 0 && e2eMs > 0 ? totalOutput / (e2eMs / 1000) : null,
      costTotal: accumulated.cost.total > 0 ? accumulated.cost.total : null,
      inputTokens: accumulated.input,
      outputTokens: accumulated.output,
      cacheReadTokens: accumulated.cacheRead,
      cacheWriteTokens: accumulated.cacheWrite,
      model: accumulatedModel,
    };

    // Reset accumulators
    agentStartTime = null;
    firstTokenTime = null;
    accumulated = null;
    accumulatedModel = null;
  });

  // --- Per-turn: track TTFT (first text token across the entire request) ---

  pi.on("message_update", async (event) => {
    if (agentStartTime == null) return;
    if (event.assistantMessageEvent.type === "text_start" && firstTokenTime == null) {
      firstTokenTime = performance.now() - agentStartTime;
    }
  });

  // --- Per-message: accumulate usage ---

  pi.on("message_end", async (event) => {
    if (event.message.role !== "assistant") return;
    if (accumulated == null) return;
    const msg = event.message as AssistantMessage;
    const u = msg.usage;

    accumulated.input += u.input;
    accumulated.output += u.output;
    accumulated.cacheRead += u.cacheRead;
    accumulated.cacheWrite += u.cacheWrite;
    accumulated.cost.input += u.cost.input;
    accumulated.cost.output += u.cost.output;
    accumulated.cost.cacheRead += u.cost.cacheRead;
    accumulated.cost.cacheWrite += u.cost.cacheWrite;
    accumulated.cost.total += u.cost.total;

    // Track the model from the last assistant message (all turns typically use same model)
    if (msg.model) accumulatedModel = msg.model;
  });

  function setupFooter(ctx: any) {
    ctx.ui.setFooter((tui: TUI, theme: Theme, footerData: ReadonlyFooterDataProvider) => {
      const unsubBranch = footerData.onBranchChange(() => tui.requestRender());
      return {
        dispose: unsubBranch,
        invalidate() {},
        render(width: number): string[] {
          const leftParts: string[] = [];
          const branch = footerData.getGitBranch();
          if (branch) leftParts.push(theme.fg("dim", `(${branch})`));
          for (const [, text] of footerData.getExtensionStatuses()) {
            leftParts.push(text);
          }
          leftParts.push(theme.fg("dim", ""));
          if (lastStats.e2eMs != null)
            leftParts.push(theme.fg("muted", `Time: ${(lastStats.e2eMs / 1000).toFixed(1)}s |`));
          if (lastStats.ttftMs != null)
            leftParts.push(theme.fg("muted", `TTFT: ${lastStats.ttftMs.toFixed(0)}ms |`));
          
          // if (lastStats.tokensPerSec != null)
          //   leftParts.push(theme.fg("muted", `${lastStats.tokensPerSec.toFixed(0)} tok/s |`));
          
          const fmt = (n: number) => n < 1000 ? `${n}` : `${(n / 1000).toFixed(1)}k`;

          if (lastStats.costTotal != null && lastStats.costTotal > 0) {
            leftParts.push(theme.fg("muted", `$${lastStats.costTotal.toFixed(4)}`));
          } else if (lastStats.inputTokens != null && lastStats.outputTokens != null) {
            leftParts.push(theme.fg("muted", `input: ${fmt(lastStats.inputTokens)} | output: ${fmt(lastStats.outputTokens)}`));
          }

          if (lastStats.cacheReadTokens != null && lastStats.cacheReadTokens > 0) {
            leftParts.push(theme.fg("muted", `| cache read: ${fmt(lastStats.cacheReadTokens)}`));
          }
          if (lastStats.cacheWriteTokens != null && lastStats.cacheWriteTokens > 0) {
            leftParts.push(theme.fg("muted", `| cache write: ${fmt(lastStats.cacheWriteTokens)}`));
          }

          const rightParts: string[] = [];
          rightParts.push(theme.fg("dim", ctx.model?.id ?? "no-model"));
          const leftStr = leftParts.join(" ");
          const rightStr = rightParts.join(" ");
          const pad = " ".repeat(Math.max(1, width - visibleWidth(leftStr) - visibleWidth(rightStr)));
          return [truncateToWidth(leftStr + pad + rightStr, width)];
        },
      };
    });
  }

  // Enable on startup
  pi.on("session_start", async (_event, ctx) => {
    setupFooter(ctx);
  });

  pi.registerCommand("footer-stats", {
    description: "Toggle extended footer stats (TTFT, tokens/sec, cost)",
    handler: async (_args, ctx) => {
      enabled = !enabled;
      if (enabled) {
        setupFooter(ctx);
      } else {
        ctx.ui.setFooter(undefined);
      }
    },
  });
}
