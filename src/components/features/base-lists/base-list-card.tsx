"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Delete02Icon,
  Edit02Icon,
  ListViewIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons";

import {
  ConfirmSheet,
  EntityCard,
  EntityEditCard,
  focusEntityMenuWhenReady,
  type EntityEditValues,
} from "@/components/commons";
import { ShareListDialog } from "@/components/features/sharing";
import { Badge } from "@/components/ui/badge";
import { useUndoableAction } from "@/hooks";
import { StartShoppingDialog } from "./start-shopping-dialog";
import { deleteBaseList, updateBaseList } from "@/lib/api/endpoints";

import type { BaseListWithCount } from "@/types";

import { buildListCardMeta } from "./helpers/list-card-meta";

interface Props {
  baseList: BaseListWithCount;
  /** What the screen calls the list when two share a name ("Weekly (2)"); the stored name stays the one edited. */
  displayName?: string;
  activeSessionId?: string;
  /** The list every account starts with; it carries a "Default" chip. */
  isDefault?: boolean;
  /** When the list was last shopped (a completed trip), and how many people it is shared with. */
  lastTripAt?: string | null;
  sharedWithCount?: number;
}

/** A base list: its card, the inline rename form, the share sheet and the delete confirmation with its Undo. */
export function BaseListCard({
  baseList,
  displayName,
  activeSessionId,
  isDefault = false,
  lastTripAt,
  sharedWithCount,
}: Props) {
  const shownName = displayName ?? baseList.name;
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const wasDeleteOpen = useRef(false);
  const router = useRouter();
  const deletion = useUndoableAction();

  useEffect(() => {
    if (
      (wasEditing.current && !editing) ||
      (wasDeleteOpen.current && !showDelete)
    ) {
      menuTriggerRef.current?.focus();
    }
    wasEditing.current = editing;
    wasDeleteOpen.current = showDelete;
  }, [editing, showDelete]);

  const handleUpdate = async ({ name, second }: EntityEditValues) => {
    try {
      const { error } = await updateBaseList(baseList.id, {
        name: name.trim(),
        notes: second.trim() ? second.trim() : null,
      });
      if (error) throw new Error(error);
      const updatedName = name.trim();
      const updatedNotes = second.trim();
      const changed =
        updatedName !== baseList.name ||
        updatedNotes !== (baseList.notes ?? "");
      setEditing(false);
      if (changed) {
        router.refresh();
        focusEntityMenuWhenReady({
          cardTestId: `list-card-${baseList.id}`,
          title: updatedName,
          description: updatedNotes,
        });
      }
      toast.success("Base list updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update base list",
      );
      throw err;
    }
  };

  // The delete cannot be brought back from the database, so it waits a few seconds behind an Undo; the card hides meanwhile.
  const handleDelete = () => {
    setShowDelete(false);
    deletion.schedule({
      message: `“${shownName}” deleted`,
      run: async () => {
        const { error } = await deleteBaseList(baseList.id);
        if (!error) router.refresh();
        return { error: error ? error : null };
      },
    });
  };

  if (deletion.pending) return null;

  if (editing) {
    return (
      <EntityEditCard
        title="Edit List"
        secondLabel="Notes"
        secondPlaceholder="Description or notes, eg. “Weekly groceries”, “Items for camping trip”"
        secondMax={200}
        initial={{ name: baseList.name, second: baseList.notes ?? "" }}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        testId={`list-edit-${baseList.id}`}
      />
    );
  }

  return (
    <>
      <EntityCard
        href={`/base-lists/${baseList.id}/edit`}
        icon={ListViewIcon}
        title={shownName}
        description={baseList.notes}
        badge={
          isDefault ? (
            <Badge variant="neutral" data-testid={`list-card-${baseList.id}-default`}>
              Default
            </Badge>
          ) : null
        }
        meta={buildListCardMeta(lastTripAt, sharedWithCount)}
        count={baseList.items_count}
        unit={{ one: "item", many: "items" }}
        emptyLabel="items"
        linkLabel="View Items"
        // A list being shopped keeps the way back into its trip on the card; otherwise the card opens the list.
        footerAction={
          activeSessionId ? (
            <StartShoppingDialog
              baseListId={baseList.id}
              baseListName={shownName}
              itemsCount={baseList.items_count}
              sessionActive
              activeSessionId={activeSessionId}
              variant="secondary"
              size="sm"
              className="w-auto"
            />
          ) : undefined
        }
        menu={{
          label: `More options for ${shownName}`,
          actions: [
            { label: "Edit List", icon: Edit02Icon, onSelect: () => setEditing(true) },
            { label: "Share", icon: Share01Icon, onSelect: () => setShowShare(true) },
            {
              label: "Delete List",
              icon: Delete02Icon,
              onSelect: () => setShowDelete(true),
              tone: "danger",
            },
          ],
        }}
        menuTriggerRef={menuTriggerRef}
        testId={`list-card-${baseList.id}`}
      />
      <ShareListDialog
        baseListId={baseList.id}
        listName={shownName}
        isOwner
        open={showShare}
        onOpenChange={setShowShare}
        trigger={null}
      />
      <ConfirmSheet
        open={showDelete}
        onOpenChange={setShowDelete}
        title={`Delete “${shownName}”?`}
        consequence={
          baseList.items_count > 0 ? (
            <>
              The{" "}
              <b className="font-mono font-semibold">{baseList.items_count}</b>{" "}
              {baseList.items_count === 1 ? "item" : "items"} in this list{" "}
              {baseList.items_count === 1 ? "is" : "are"} deleted with it.
              People it is shared with lose access. This can’t be undone.
            </>
          ) : (
            "People it is shared with lose access. This can’t be undone."
          )
        }
        confirmLabel="Delete List"
        loadingLabel="Deleting…"
        tone="danger"
        onConfirm={handleDelete}
        testId={`list-delete-${baseList.id}`}
      />
    </>
  );
}
