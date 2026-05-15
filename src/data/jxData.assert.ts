// Compile-time only: guarantees JX_PROJECTS conforms to the Project shape and
// that SiteContent can carry the register. Not imported at runtime (no module
// imports this), so it is tree-shaken from the production build. The exported
// binding keeps it `noUnusedLocals`-clean WITHOUT an eslint-disable: tsc still
// enforces the assignability check, so a JX_PROJECTS shape drift fails the
// `tsc --noEmit` gate.
import type { SiteContent } from '../types/content'
import { JX_PROJECTS } from './jxData'

export const _assertRegisterShape: NonNullable<SiteContent['register']> = JX_PROJECTS
