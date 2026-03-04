import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { classNames } from "@/utils/classNames";
import styles from './Resizable.module.css';

export interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {}

export function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizablePrimitive.PanelGroup
      className={classNames(styles.panelGroup, className)}
      {...props}
    />
  );
}

export const ResizablePanel = ResizablePrimitive.Panel;

export interface ResizableHandleProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  withHandle?: boolean;
}

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      className={classNames(styles.handle, className)}
      {...props}
    >
      {withHandle && (
        <div className={styles.handleIcon}>
          <GripVertical className={styles.gripIcon} />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}
