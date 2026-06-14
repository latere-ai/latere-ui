<script setup lang="ts">
// Shared in-app docs shell: a grouped doc index (left) · the article (center)
// · an auto table of contents (right) · prev/next across the flattened reading
// order. Works for both markdown docs (pass `articleHtml`) and component-driven
// docs (use the #article slot, as the document-intelligence console does).
//
// The grouped model and TOC scroll-spy are headless (src/docs/*); this is the
// Vue adapter. App-specific post-processing — mermaid, light/dark images,
// `[[diagram:name]]` mounts — plugs into the `enhance` hook; the layout never
// owns a diagram pipeline. Styles ship as `latere-ui/docs` (prefix `lu-docs-`).

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Component,
} from 'vue';

import {
  adjacentDocs,
  docPath,
  findDoc,
  type DocGroup,
  type FlatDoc,
} from '../docs/model';
import { createToc } from '../docs/toc';

interface Props {
  /** Grouped document index. */
  groups: DocGroup[];
  /** Active page slug. */
  activeSlug: string;
  /** Disambiguate when the same slug appears in multiple groups. */
  activeGroupId?: string;
  /** Rendered markdown body (v-html). Omit to use the #article slot. */
  articleHtml?: string;
  /** Title above the body. Defaults to the active page's title. */
  articleTitle?: string;
  /** Injected RouterLink; falls back to a plain `<a>` off-router. */
  routerLink?: Component;
  /** Route base used to build nav hrefs (`<base>/<group>/<slug>`). */
  base?: string;
  /** Render the right-hand TOC. */
  showToc?: boolean;
  /** Heading levels included in the TOC. */
  tocLevels?: number[];
  /**
   * Called with the article element after every (re)render, before the TOC is
   * scanned. Plug in app-specific enhancement (diagrams, image rewriting).
   */
  enhance?: (el: HTMLElement) => void;
  // Copy overrides.
  eyebrow?: string;
  tocLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  base: '',
  showToc: true,
  eyebrow: 'Docs',
  tocLabel: 'On this page',
  prevLabel: 'Previous',
  nextLabel: 'Next',
});

const emit = defineEmits<{
  navigate: [doc: FlatDoc];
  'toc-select': [id: string];
}>();

const articleRef = ref<HTMLElement | null>(null);
const toc = createToc({ levels: props.tocLevels });

const currentDoc = computed(() =>
  findDoc(props.groups, props.activeSlug, props.activeGroupId),
);
const heading = computed(() => props.articleTitle ?? currentDoc.value?.title ?? '');
const adjacent = computed(() =>
  adjacentDocs(props.groups, props.activeSlug, props.activeGroupId),
);

function isActive(group: DocGroup, slug: string): boolean {
  return (
    slug === props.activeSlug &&
    (props.activeGroupId === undefined || group.id === props.activeGroupId)
  );
}

function hrefFor(groupId: string, slug: string): string {
  return docPath(groupId, slug, props.base);
}

function rowTag(): Component | string {
  return props.routerLink ?? 'a';
}
function rowBind(groupId: string, slug: string): Record<string, unknown> {
  const target = hrefFor(groupId, slug);
  return props.routerLink ? { to: target } : { href: target };
}

function onNavigate(doc: FlatDoc | null) {
  if (doc) emit('navigate', doc);
}
function onTocClick(id: string) {
  toc.setActive(id);
  emit('toc-select', id);
}

// Re-run enhancement + TOC scan whenever the rendered body changes.
function refresh() {
  const el = articleRef.value;
  if (!el) return;
  props.enhance?.(el);
  if (props.showToc) toc.scan(el);
  else toc.dispose();
}

onMounted(() => {
  void nextTick(refresh);
});
watch(
  () => [props.articleHtml, props.activeSlug, props.articleTitle],
  () => {
    void nextTick(refresh);
  },
);
onBeforeUnmount(() => toc.dispose());

defineExpose({ refresh, toc });
</script>

<template>
  <div class="lu-docs">
    <aside class="lu-docs-side">
      <slot name="sidebar-head">
        <div class="lu-docs-eyebrow">{{ eyebrow }}</div>
      </slot>
      <nav class="lu-docs-nav">
        <div
          v-for="group in groups"
          :key="group.id"
          class="lu-docs-group"
          :data-advanced="group.advanced ? 'true' : 'false'"
        >
          <div class="lu-docs-group-label">
            <slot name="group-icon" :group="group" />
            <span>{{ group.label }}</span>
          </div>
          <component
            :is="rowTag()"
            v-for="page in group.pages"
            :key="page.slug"
            v-bind="rowBind(group.id, page.slug)"
            class="lu-docs-link"
            :data-active="isActive(group, page.slug) ? 'true' : 'false'"
            :data-advanced="page.advanced ? 'true' : 'false'"
            :aria-current="isActive(group, page.slug) ? 'page' : undefined"
            @click="onNavigate(findDoc(groups, page.slug, group.id))"
          >
            <span class="lu-docs-link-label">{{ page.title }}</span>
            <span v-if="page.badge !== undefined" class="lu-docs-link-badge">{{ page.badge }}</span>
          </component>
        </div>
      </nav>
    </aside>

    <main class="lu-docs-main">
      <article ref="articleRef" class="lu-docs-article">
        <h1 v-if="heading" class="lu-docs-title">{{ heading }}</h1>
        <slot name="article">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="lu-docs-body" v-html="articleHtml" />
        </slot>
      </article>

      <nav v-if="adjacent.prev || adjacent.next" class="lu-docs-pager">
        <component
          :is="rowTag()"
          v-if="adjacent.prev"
          v-bind="rowBind(adjacent.prev.groupId, adjacent.prev.slug)"
          class="lu-docs-pager-link lu-docs-pager-prev"
          @click="onNavigate(adjacent.prev)"
        >
          <span class="lu-docs-pager-dir">{{ prevLabel }}</span>
          <span class="lu-docs-pager-title">{{ adjacent.prev.title }}</span>
        </component>
        <span v-else />
        <component
          :is="rowTag()"
          v-if="adjacent.next"
          v-bind="rowBind(adjacent.next.groupId, adjacent.next.slug)"
          class="lu-docs-pager-link lu-docs-pager-next"
          @click="onNavigate(adjacent.next)"
        >
          <span class="lu-docs-pager-dir">{{ nextLabel }}</span>
          <span class="lu-docs-pager-title">{{ adjacent.next.title }}</span>
        </component>
      </nav>
    </main>

    <aside v-if="showToc" class="lu-docs-toc">
      <slot name="toc" :items="toc.items.value" :active-id="toc.activeId.value">
        <div v-if="toc.items.value.length" class="lu-docs-toc-inner">
          <div class="lu-docs-toc-label">{{ tocLabel }}</div>
          <a
            v-for="item in toc.items.value"
            :key="item.id"
            :href="`#${item.id}`"
            class="lu-docs-toc-link"
            :data-level="item.level"
            :data-active="toc.activeId.value === item.id ? 'true' : 'false'"
            @click="onTocClick(item.id)"
          >{{ item.text }}</a>
        </div>
      </slot>
    </aside>
  </div>
</template>
