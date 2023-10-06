import type { GatsbyNode } from "gatsby";

export { sourceNodes } from "./source-nodes"

export const onPluginInit: GatsbyNode["onPluginInit"] = (
	{
		// reporter,
	},
): void => {
	// reporter.setErrorMap(ERROR_MAP)
};
