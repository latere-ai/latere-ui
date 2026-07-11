<script setup lang="ts">
// Host for the imperative confirm() service. Mount ONCE near the app root:
//   <GlassConfirmHost />
// Renders the active confirm dialog on a GlassModal. Requires 'latere-ui/glass'.
import { computed } from 'vue';
import GlassModal from './GlassModal.vue';
import GlassButton from './GlassButton.vue';
import { currentConfirm, resolveConfirm } from '../glass/confirm';

const open = computed(() => currentConfirm.current !== null);
const c = computed(() => currentConfirm.current);
</script>

<template>
  <GlassModal
    :open="open"
    :title="c?.title"
    :close-on-scrim="false"
    width="26rem"
    layer="confirm"
    @close="resolveConfirm(false)"
  >
    <p class="lu-confirm-msg">{{ c?.message }}</p>
    <template #footer>
      <GlassButton variant="ghost" size="sm" @click="resolveConfirm(false)">
        {{ c?.cancelText ?? 'Cancel' }}
      </GlassButton>
      <GlassButton
        :variant="c?.danger ? 'danger' : 'primary'"
        size="sm"
        @click="resolveConfirm(true)"
      >
        {{ c?.confirmText ?? 'Confirm' }}
      </GlassButton>
    </template>
  </GlassModal>
</template>

<style scoped>
.lu-confirm-msg { font-size: var(--fs-body-sm, 13px); color: var(--text-secondary, #666); line-height: 1.6; }
</style>
