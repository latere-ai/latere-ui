import { useId, useRef, useSyncExternalStore } from 'react';
import { confirmStore, getServerConfirm, resolveConfirm } from '../glass/confirmCore';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import '../styles/components/glass-confirm-host.css';

/** Mount once near the app root to render queued confirm() requests. */
export function GlassConfirmHost() {
  const { current: c } = useSyncExternalStore(confirmStore.subscribe, confirmStore.getSnapshot, getServerConfirm);
  const messageId = useId();
  // Each request gets its own dialog, so its focus trap sets up again and
  // focus starts on the new request's first control instead of staying on
  // the button that answered the last one. The id outlives the last request
  // so the closing dialog keeps its leave transition.
  const lastId = useRef(0);
  if (c) lastId.current = c.id;
  return (
    <GlassModal
      key={lastId.current}
      open={c !== null}
      title={c?.title}
      closeOnScrim={false}
      width="26rem"
      layer="confirm"
      labelledBy={c && !c.title ? messageId : undefined}
      describedBy={c?.title ? messageId : undefined}
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
      <p id={messageId} className="lu-confirm-msg">{c?.message}</p>
    </GlassModal>
  );
}
