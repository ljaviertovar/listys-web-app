import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AlertDialog, AlertDialogOverlay } from "@/components/ui/alert-dialog";
import AppLoading from "@/components/app/app-loading";
import { Dialog, DialogOverlay } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

describe("reduced-motion support in shared feedback primitives", () => {
  it("keeps dialog overlays still and removes their animation duration", () => {
    const dialog = renderToStaticMarkup(
      createElement(Dialog, { open: true }, createElement(DialogOverlay)),
    );
    const alert = renderToStaticMarkup(
      createElement(
        AlertDialog,
        { open: true },
        createElement(AlertDialogOverlay),
      ),
    );

    for (const html of [dialog, alert]) {
      expect(html).toContain("motion-reduce:animate-none");
      expect(html).toContain("motion-reduce:duration-0");
      expect(html).toContain("transition-opacity");
    }
    expect(dialog).toContain("motion-reduce:data-[state=open]:animate-none");
    expect(alert).toContain("motion-reduce:data-open:animate-none");
  });

  it("keeps progress updates informative without animating under reduced motion", () => {
    const html = renderToStaticMarkup(
      createElement(Progress, { value: 40, "aria-label": "Progress" }),
    );

    expect(html).toContain("transition-transform");
    expect(html).toContain("motion-reduce:transition-none");
  });

  it("keeps loading indicators visible without pulsing or spinning under reduced motion", () => {
    const html = renderToStaticMarkup(createElement(AppLoading));

    expect(html.match(/motion-reduce:animate-none/g)).toHaveLength(2);
  });
});
