import { flushSync } from "react-dom";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

/** Run a state update inside a view transition when the browser allows motion. */
export function runMotion(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = (document as ViewTransitionDocument).startViewTransition;
  if (reduce || !start) {
    update();
    return;
  }
  start(() => {
    flushSync(update);
  });
}
