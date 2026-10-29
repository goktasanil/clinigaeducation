import { useEffect, type RefObject } from "react";

type Instance = { destroy: () => void };
type Runtime = { mount: (root: HTMLElement) => Instance };
declare global {
  interface Window {
    ScrollCraft?: Runtime;
  }
}
let runtimePromise: Promise<Runtime> | undefined;
function loadRuntime() {
  if (window.ScrollCraft) return Promise.resolve(window.ScrollCraft);
  if (!runtimePromise) {
    runtimePromise = new Promise<Runtime>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${import.meta.env.BASE_URL}scrollcraft/scrollcraft.js`;
      script.async = true;
      script.onload = () => {
        if (window.ScrollCraft) resolve(window.ScrollCraft);
        else reject(new Error("ScrollCraft runtime did not initialize"));
      };
      script.onerror = () => {
        script.remove();
        runtimePromise = undefined;
        reject(new Error("ScrollCraft runtime could not be loaded"));
      };
      document.head.append(script);
    });
  }
  return runtimePromise;
}

export function useScrollCraft(
  root: RefObject<HTMLDivElement | null>,
  paused: boolean,
  revision: string,
) {
  useEffect(() => {
    const element = root.current;
    if (!element || paused) return;
    return observeScrollCraft(element);
  }, [root, paused, revision]);
}

const DEVICES = "[data-sc-act],[data-sc-in],[data-sc-tilt],[data-sc-parallax],[data-sc-reveal]";

// The root route can commit before its lazy Outlet. The engine scans once,
// so reconcile only when actual scene elements are inserted or removed.
export function observeScrollCraft(element: HTMLDivElement) {
  let disposed = false;
  let frame = 0;
  let runtime: Runtime | undefined;
  let instance: Instance | undefined;
  let devices: Element[] = [];
  const reconcile = () => {
    frame = 0;
    if (disposed || !runtime) return;
    const next = [...element.querySelectorAll(DEVICES)];
    if (next.length === devices.length && next.every((node, index) => node === devices[index]))
      return;
    instance?.destroy();
    instance = undefined;
    element.removeAttribute("data-sc-ready");
    devices = next;
    if (!next.length) return;
    instance = runtime.mount(element);
    element.dataset.scReady = "true";
  };
  const containsDevice = (node: Node) =>
    node.nodeType === 1 &&
    ((node as Element).matches(DEVICES) || Boolean((node as Element).querySelector(DEVICES)));
  const observer = new MutationObserver((records) => {
    if (
      !records.some((record) => [...record.addedNodes, ...record.removedNodes].some(containsDevice))
    )
      return;
    if (!frame) frame = requestAnimationFrame(reconcile);
  });
  observer.observe(element, { childList: true, subtree: true });
  void loadRuntime()
    .then((loaded) => {
      if (disposed) return;
      runtime = loaded;
      reconcile();
    })
    .catch(() => {
      if (!disposed) element.removeAttribute("data-sc-ready");
    });
  return () => {
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    instance?.destroy();
    element.removeAttribute("data-sc-ready");
  };
}
