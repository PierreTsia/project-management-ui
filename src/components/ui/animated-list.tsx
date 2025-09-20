import { AnimatePresence, motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

// Animation constants
const ANIMATION_DURATION = 0.3;
const INITIAL_SCALE = 0.95;
const INITIAL_OPACITY = 0;
const INITIAL_X_OFFSET = 16;
const FINAL_SCALE = 1;
const FINAL_OPACITY = 1;
const FINAL_X_OFFSET = 0;

interface AnimatedListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  motionProps?: MotionProps;
}

export function AnimatedList<T>({
  items,
  getKey,
  renderItem,
  className = '',
  motionProps = {},
}: AnimatedListProps<T>) {
  return (
    <div className={className}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={getKey(item)}
            initial={{
              opacity: INITIAL_OPACITY,
              scale: INITIAL_SCALE,
              x: INITIAL_X_OFFSET,
            }}
            animate={{
              opacity: FINAL_OPACITY,
              scale: FINAL_SCALE,
              x: FINAL_X_OFFSET,
            }}
            exit={{
              opacity: INITIAL_OPACITY,
              scale: INITIAL_SCALE,
              x: INITIAL_X_OFFSET,
            }}
            transition={{
              duration: ANIMATION_DURATION,
              delay: index * 0.05, // Staggered animation
              ...motionProps.transition,
            }}
            layout
            {...motionProps}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
