interface FocusEntityMenuWhenReadyOptions {
  cardTestId: string;
  title: string;
  description: string;
}

/** Restores focus only after a refreshed card displays the saved values. */
export function focusEntityMenuWhenReady({
  cardTestId,
  title,
  description,
}: FocusEntityMenuWhenReadyOptions) {
  const focusIfReady = () => {
    const card = document.querySelector<HTMLElement>(
      `[data-testid="${cardTestId}"]`,
    );
    const trigger = document.querySelector<HTMLButtonElement>(
      `[data-testid="${cardTestId}-menu"]`,
    );
    const renderedTitle = card?.querySelector("h2")?.textContent?.trim();
    const renderedDescription =
      card?.querySelector("p")?.textContent?.trim() ?? "";

    if (
      !trigger ||
      renderedTitle !== title ||
      renderedDescription !== description
    )
      return false;

    trigger.focus();
    return document.activeElement === trigger;
  };

  if (focusIfReady()) return;

  const timeout = { id: 0 };
  const observer = new MutationObserver(() => {
    if (focusIfReady()) {
      observer.disconnect();
      window.clearTimeout(timeout.id);
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  timeout.id = window.setTimeout(() => observer.disconnect(), 10_000);
}
