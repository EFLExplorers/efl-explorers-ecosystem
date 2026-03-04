import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { classNames } from "@/utils/classNames";
import styles from './Sidebar.module.css';

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export interface SidebarProviderProps
  extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  SidebarProviderProps
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        if (setOpenProp) {
          return setOpenProp?.(
            typeof value === "function" ? value(open) : value
          );
        }
        _setOpen(value);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={classNames(styles.provider, className)}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

export interface SidebarProps
  extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div
          className={classNames(styles.sidebar, styles.sidebarNone, className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={styles.sheetContent}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className={styles.sheetInner}>{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className={classNames(styles.sidebarWrapper, className)}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        <div className={styles.sidebarGap} />
        <div className={classNames(styles.sidebar, styles[side], styles[collapsible], styles[variant])}>
          <div className={styles.sidebarInner}>{children}</div>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

export interface SidebarTriggerProps
  extends React.ComponentProps<typeof Button> {}

export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarTriggerProps
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={classNames(styles.trigger, className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className={styles.srOnly}>Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export interface SidebarInsetProps extends React.ComponentProps<"main"> {}

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={classNames(styles.inset, className)}
        {...props}
      />
    );
  }
);
SidebarInset.displayName = "SidebarInset";

export interface SidebarInputProps
  extends React.ComponentProps<typeof Input> {}

export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  SidebarInputProps
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={classNames(styles.input, className)}
      {...props}
    />
  );
});
SidebarInput.displayName = "SidebarInput";

export interface SidebarHeaderProps extends React.ComponentProps<"div"> {}

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={classNames(styles.header, className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export interface SidebarFooterProps extends React.ComponentProps<"div"> {}

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  SidebarFooterProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={classNames(styles.footer, className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export interface SidebarSeparatorProps
  extends React.ComponentProps<typeof Separator> {}

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  SidebarSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={classNames(styles.separator, className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

export interface SidebarContentProps extends React.ComponentProps<"div"> {}

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={classNames(styles.content, className)}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export interface SidebarGroupProps extends React.ComponentProps<"div"> {}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"
        className={classNames(styles.group, className)}
        {...props}
      />
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";

export interface SidebarGroupLabelProps
  extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  SidebarGroupLabelProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={classNames(styles.groupLabel, className)}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export interface SidebarGroupContentProps extends React.ComponentProps<"div"> {}

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={classNames(styles.groupContent, className)}
    {...props}
  />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export interface SidebarMenuProps extends React.ComponentProps<"ul"> {}

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  SidebarMenuProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={classNames(styles.menu, className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export interface SidebarMenuItemProps extends React.ComponentProps<"li"> {}

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  SidebarMenuItemProps
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={classNames(styles.menuItem, className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
  extends React.ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={classNames(styles.menuButton, styles[`menuButton${variant}`], styles[`menuButton${size}`], className)}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
