"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListViewIcon } from "@hugeicons/core-free-icons";

import {
  ConfirmSheet,
  EntityCard,
  EntityEditCard,
  focusEntityMenuWhenReady,
  type EntityEditValues,
} from "@/components/commons";
import { deleteBaseList, updateBaseList } from "@/lib/api/endpoints";

import type { BaseListWithCount } from "@/types";

interface Props {
  baseList: BaseListWithCount;
  /** What the screen calls the list when two share a name ("Weekly (2)"); the stored name stays the one edited. */
  displayName?: string;
}

/** A base list: its card, the inline rename form and the delete confirmation. */
export function BaseListCard({ baseList, displayName }: Props) {
  const shownName = displayName ?? baseList.name;
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const wasDeleteOpen = useRef(false);
  const router = useRouter();

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await deleteBaseList(baseList.id);
      if (error) throw new Error(error);
      router.refresh();
      toast.success("Base list deleted");
      setShowDelete(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete base list",
      );
    } finally {
      setDeleting(false);
    }
  };

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
        count={baseList.items_count}
        unit={{ one: "item", many: "items" }}
        emptyLabel="items"
        linkLabel="View Items"
        menu={{
          label: `More options for ${shownName}`,
          editLabel: "Edit List",
          deleteLabel: "Delete List",
          onEdit: () => setEditing(true),
          onDelete: () => setShowDelete(true),
        }}
        menuTriggerRef={menuTriggerRef}
        testId={`list-card-${baseList.id}`}
      />
      <ConfirmSheet
        open={showDelete}
        onOpenChange={setShowDelete}
        title={`Delete “${shownName}”?`}
        consequence={
          baseList.items_count > 0 ? (
            <>
              Its{" "}
              <b className="font-mono font-semibold">{baseList.items_count}</b>{" "}
              {baseList.items_count === 1 ? "item goes" : "items go"} with it,
              and the people it is shared with lose access. It can’t be undone.
            </>
          ) : (
            "The people it is shared with lose access. It can’t be undone."
          )
        }
        confirmLabel="Delete List"
        loadingLabel="Deleting…"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        testId={`list-delete-${baseList.id}`}
      />
    </>
  );
}
