import { useSyncExternalStore } from 'react';
import { confirmStore, getServerConfirm, resolveConfirm } from '../glass/confirmCore';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import '../styles/components/glass-confirm-host.css';

/** Mount once near the app root to render queued confirm() requests. */
export function GlassConfirmHost() {
  const { current: c } = useSyncExternalStore(confirmStore.subscribe, confirmStore.getSnapshot, getServerConfirm);
  return (
    <GlassModal
      open={c !== null}
      title={c?.title}
      closeOnScrim={false}
      width="26rem"
      layer="confirm"
      onClose={() => resolveConfirm(false)}
      footer={<>
        <GlassButton variant="ghost" size="sm" onClick={() => resolveConfirm(false)}>
          {c?.cancelText ?? 'Cancel'}
        </GlassButton>
        <GlassButton variant={c?.danger ? 'danger' : 'primary'} size="sm" onClick={() => resolveConfirm(true)}>
          {c?.confirmText ?? 'Confirm'}
        </GlassButton>
      </>}
    >
      <p className="lu-confirm-msg">{c?.message}</p>
    </GlassModal>
  );
}
