// Vue state adapter over the shared DOM outline and scroll-spy controller.
import { ref, type Ref } from 'vue';
import { createTocCore, type TocItem, type TocOptions } from './tocCore';
export { slugify, headingSlugSource } from './tocCore';
export type { TocItem, TocOptions } from './tocCore';

export interface TocController {
  items: Ref<TocItem[]>;
  activeId: Ref<string>;
  scan: (container: HTMLElement | null) => TocItem[];
  setActive: (id: string) => void;
  dispose: () => void;
}

export function createToc(opts: TocOptions = {}): TocController {
  const items = ref<TocItem[]>([]);
  const activeId = ref('');
  const core = createTocCore(opts, state => { items.value = state.items; activeId.value = state.activeId; });
  return { items, activeId, scan: core.scan, setActive: core.setActive, dispose: core.dispose };
}
