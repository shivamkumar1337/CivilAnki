import { FlexStyle } from "react-native"
import { Edge, useSafeAreaInsets } from "react-native-safe-area-context"

export type ExtendedEdge = Edge | "start" | "end"

const propertySuffixMap = {
  top: "Top",
  bottom: "Bottom",
  left: "Start",
  right: "End",
  start: "Start",
  end: "End",
}

const edgeInsetMap = {
  start: "left",
  end: "right",
}

/**
 * A hook that can be used to create a safe-area-aware style object that can be passed directly to a View.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Utils-useSafeAreaInsetsStyle.md)
 */
export function useSafeAreaInsetsStyle(
  safeAreaEdges: ExtendedEdge[] = [],
  property: "padding" | "margin" = "padding",
): Pick<
  FlexStyle,
  | "marginBottom"
  | "marginEnd"
  | "marginStart"
  | "marginTop"
  | "paddingBottom"
  | "paddingEnd"
  | "paddingStart"
  | "paddingTop"
> {
  const insets = useSafeAreaInsets()

  return safeAreaEdges.reduce((acc, e) => {
    const edge = (edgeInsetMap as Record<string, keyof typeof insets>)[e] ?? e;
    const suffix = propertySuffixMap[e as keyof typeof propertySuffixMap];
    return { ...acc, [`${property}${suffix}`]: insets[edge as keyof typeof insets] }
  }, {})
}
