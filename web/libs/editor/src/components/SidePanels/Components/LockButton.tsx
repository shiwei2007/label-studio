import { IconLockLocked, IconLockUnlocked } from "@humansignal/icons";
import type { ButtonProps } from "@humansignal/ui";
import type { HotkeyList } from "libs/editor/src/core/Hotkey";
import { observer } from "mobx-react";
import type { FC } from "react";
import { FF_DEV_3873, isFF } from "../../../utils/feature-flags";
import { RegionControlButton } from "./RegionControlButton";

export const LockButton: FC<{
  item: any;
  annotation: any;
  hovered: boolean;
  locked: boolean;
  hotkey?: string;
  variant?: ButtonProps["variant"];
  look?: ButtonProps["look"];
  ariaLabel?: string;
  tooltip?: string;
  style?: ButtonProps["style"];
  displayedHotkey?: string;
  onClick: () => void;
}> = observer(
  ({
    item,
    annotation,
    hovered,
    locked,
    hotkey,
    variant,
    displayedHotkey,
    look,
    ariaLabel,
    tooltip,
    style,
    onClick,
  }) => {
    if (!item) return null;
    const isLocked = locked || item.isReadOnly() || annotation.isReadOnly();
    const isRegionReadonly = item.isReadOnly() && !locked;

  if (isFF(FF_DEV_3873)) {
    return (
      <RegionControlButton
        disabled={isRegionReadonly}
        onClick={onClick}
        displayedHotkey={displayedHotkey}
        hotkey={hotkey}
        variant={variant}
        look={look}
        style={style}
      >
        {isLocked ? <IconLockLocked /> : <IconLockUnlocked />}
      </RegionControlButton>
    );
  },
);
