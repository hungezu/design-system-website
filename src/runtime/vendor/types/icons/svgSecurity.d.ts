export interface SvgSecurityResult {
    ok: boolean;
    errors: string[];
    svg?: string;
}
/**
 * Shared URL/IRI security inspection for imported and already-stored SVG.
 * Only same-document #fragment references are allowed. Namespace declarations
 * are metadata, not fetchable resources, and are restricted to the SVG/XLink
 * standards.
 */
export declare function inspectSvgSecurity(document: Document): string[];
/** Final guard used immediately before dangerouslySetInnerHTML. */
export declare function sanitizeSvgForRender(svg: string): SvgSecurityResult;
