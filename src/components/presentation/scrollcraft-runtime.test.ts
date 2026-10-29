import { afterEach, describe, expect, it, vi } from "vitest";
import { observeScrollCraft } from "./scrollcraft-runtime";

afterEach(() => vi.unstubAllGlobals());

function surface() {
  let devices: object[] = [];
  let mutation: MutationCallback = () => {};
  let scheduled: FrameRequestCallback | undefined;
  const destroy = vi.fn();
  const mount = vi.fn(() => ({ destroy }));
  const disconnect = vi.fn();
  const root = {
    dataset: {} as Record<string, string>,
    querySelectorAll: () => devices,
    removeAttribute: () => {
      delete root.dataset.scReady;
    },
  };
  vi.stubGlobal("window", { ScrollCraft: { mount } });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    scheduled = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    scheduled = undefined;
  });
  vi.stubGlobal(
    "MutationObserver",
    class {
      constructor(callback: MutationCallback) {
        mutation = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const scene = () => ({ nodeType: 1, matches: () => true, querySelector: () => null });
  const notify = (added: object[], removed: object[] = []) => {
    mutation(
      [{ addedNodes: added, removedNodes: removed } as unknown as MutationRecord],
      {} as MutationObserver,
    );
    const callback = scheduled;
    scheduled = undefined;
    callback?.(0);
  };
  return {
    root,
    mount,
    destroy,
    disconnect,
    scene,
    notify,
    setDevices: (next: object[]) => {
      devices = next;
    },
  };
}

describe("ScrollCraft lazy route lifecycle", () => {
  it("mounts scenes that arrive after the route shell, without remounting for text or tool updates", async () => {
    const test = surface();
    const stop = observeScrollCraft(test.root as unknown as HTMLDivElement);
    await Promise.resolve();
    expect(test.mount).not.toHaveBeenCalled();
    const scene = test.scene();
    test.setDevices([scene]);
    test.notify([scene]);
    expect(test.mount).toHaveBeenCalledTimes(1);
    expect(test.root.dataset.scReady).toBe("true");
    test.notify([{ nodeType: 3 }]);
    test.notify([{ nodeType: 1, matches: () => false, querySelector: () => null }]);
    expect(test.mount).toHaveBeenCalledTimes(1);
    const second = test.scene();
    test.setDevices([scene, second]);
    test.notify([second]);
    expect(test.destroy).toHaveBeenCalledTimes(1);
    expect(test.mount).toHaveBeenCalledTimes(2);
    stop();
    expect(test.destroy).toHaveBeenCalledTimes(2);
    expect(test.disconnect).toHaveBeenCalledOnce();
    expect(test.root.dataset.scReady).toBeUndefined();
  });

  it("releases the engine when the last scene is removed", async () => {
    const test = surface();
    const scene = test.scene();
    test.setDevices([scene]);
    const stop = observeScrollCraft(test.root as unknown as HTMLDivElement);
    await Promise.resolve();
    expect(test.mount).toHaveBeenCalledOnce();
    test.setDevices([]);
    test.notify([], [scene]);
    expect(test.destroy).toHaveBeenCalledOnce();
    expect(test.root.dataset.scReady).toBeUndefined();
    stop();
    expect(test.destroy).toHaveBeenCalledOnce();
  });

  it("does not mount after disposal while the runtime promise is resolving", async () => {
    const test = surface();
    test.setDevices([test.scene()]);
    const stop = observeScrollCraft(test.root as unknown as HTMLDivElement);
    stop();
    await Promise.resolve();
    expect(test.mount).not.toHaveBeenCalled();
  });
});
