import { type ReactNode } from 'react'
import { usePreviewVariables, usePreviewOwner } from '../../theme/preview-context'
import { ModalOverlay, Modal, Dialog, Heading } from 'react-aria-components'
import { DSIconAction } from '../IconAction'
import './Overlays.css'
export type DialogSize = 'sm' | 'md' | 'lg'
export interface DSDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string
  children?: ReactNode; footer?: ReactNode; size?: DialogSize; dismissible?: boolean; closeOnEscape?: boolean; 'aria-label'?: string; role?: 'dialog' | 'alertdialog'; loading?: boolean
}
export type DSDrawerProps = DSDialogProps
function Overlay({ open, onOpenChange, title, description, children, footer, size = 'md', dismissible = true, closeOnEscape = true, loading, drawer, 'aria-label': ariaLabel, role = 'dialog' }: DSDrawerProps & { drawer?: boolean }) {
  const vars = usePreviewVariables()
  const owner=usePreviewOwner()
  return <>
    <ModalOverlay data-preview-owner={owner} className={`owned-overlay${drawer ? ' owned-overlay--drawer' : ''}`} style={vars} isOpen={open} onOpenChange={onOpenChange} isDismissable={dismissible && !loading} isKeyboardDismissDisabled={!closeOnEscape || loading}>
      <Modal className={`owned-modal owned-modal--${size}${drawer ? ' owned-modal--drawer' : ''}`}>
        <Dialog role={role} aria-label={ariaLabel} className="owned-dialog" aria-busy={loading || undefined}>
          {({close}) => <><header><Heading slot="title">{title}</Heading><DSIconAction semantic="close" compact aria-label={`关闭${title}`} onPress={close} isDisabled={loading} /></header>
            {description && <p className="owned-dialog__description">{description}</p>}<div className="owned-dialog__body">{children}</div>{footer && <footer>{footer}</footer>}</>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  </>
}
export function DSDialog(props: DSDialogProps) { return <Overlay {...props} /> }
export function DSDrawer(props: DSDrawerProps) { return <Overlay {...props} drawer /> }
