export const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
export const ANTHROPIC_VERSION = "2023-06-01";

export const ANTHROPIC_REASONING: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = {
  none: { thinking: { type: "disabled" } },
  low: { thinking: { type: "adaptive" }, output_config: { effort: "low" } },
  medium: {
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
  },
  high: { thinking: { type: "adaptive" }, output_config: { effort: "high" } },
  xhigh: {
    thinking: { type: "adaptive" },
    output_config: { effort: "xhigh" },
  },
  max: { thinking: { type: "adaptive" }, output_config: { effort: "max" } },
};
