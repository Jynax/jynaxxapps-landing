// Compile-time only: fails `tsc` if JX_PROJECTS drifts from the register shape.
// Never imported at runtime (tree-shaken).
import type { SiteContent } from '../types/content'
import { JX_PROJECTS } from './jxData'

JX_PROJECTS satisfies NonNullable<SiteContent['register']>

export {}
