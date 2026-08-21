import { describe, it, expect, beforeEach } from "vitest";
import { useWizardStore } from "../store/wizard-store";

describe("Web: Wizard Store", () => {
  beforeEach(() => {
    useWizardStore.getState().reset();
  });

  it("should initialize with default step 1 and default options", () => {
    const state = useWizardStore.getState();
    expect(state.step).toBe(1);
    expect(state.viewport).toBe("desktop");
    expect(state.format).toBe("react");
    expect(state.selectedElements.length).toBeGreaterThan(0);
  });

  it("should navigate through steps", () => {
    const store = useWizardStore.getState();
    store.setStep(2);
    expect(useWizardStore.getState().step).toBe(2);

    store.setStep(3);
    expect(useWizardStore.getState().step).toBe(3);

    store.setStep(4);
    expect(useWizardStore.getState().step).toBe(4);
  });

  it("should toggle selected elements", () => {
    const store = useWizardStore.getState();
    const testId = "pricing-table";

    // Toggle on
    store.toggleSelectedElement(testId);
    expect(useWizardStore.getState().selectedElements).toContain(testId);

    // Toggle off
    store.toggleSelectedElement(testId);
    expect(useWizardStore.getState().selectedElements).not.toContain(testId);
  });

  it("should open and reset cleanly with custom url", () => {
    const store = useWizardStore.getState();
    store.open("https://github.com");

    expect(useWizardStore.getState().isOpen).toBe(true);
    expect(useWizardStore.getState().url).toBe("https://github.com");
    expect(useWizardStore.getState().step).toBe(1);

    store.close();
    expect(useWizardStore.getState().isOpen).toBe(false);
  });
});
