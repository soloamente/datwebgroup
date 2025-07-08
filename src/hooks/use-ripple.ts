import { useCallback, useState } from "react";
import { PressEvent } from "react-aria-components";

function getUniqueID(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
}

type RippleType = {
  key: React.Key;
  x: number;
  y: number;
  size: number;
};

export function useRipple() {
  const [ripples, setRipples] = useState<RippleType[]>([]);

  const onPress = useCallback((e: PressEvent) => {
    const trigger = e.target;

    const size = Math.max(trigger.clientWidth, trigger.clientHeight);

    setRipples((prevRipples) => [
      ...prevRipples,
      {
        key: getUniqueID(prevRipples.length.toString()),
        size,
        x: e.x - size / 2,
        y: e.y - size / 2,
      },
    ]);
  }, []);

  const onClear = useCallback((key: React.Key) => {
    setRipples((prevState) => prevState.filter((ripple) => ripple.key !== key));
  }, []);

  return { ripples, onClear, onPress };
}
