import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

// Confirmation dialog for destructive or irreversible actions.
export function Confirm({ open, title, message, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Keep as is
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={go} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
