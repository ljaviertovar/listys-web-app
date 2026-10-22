"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder01Icon } from "@hugeicons/core-free-icons";

import {
  ConfirmSheet,
  EntityCard,
  EntityEditCard,
  focusEntityMenuWhenReady,
  type EntityEditValues,
} from "@/components/commons";
import { deleteGroup, updateGroup } from "@/actions";

interface Group {
  id: string;
  name: string;
  description?: string | null;
  base_lists?: Array<{ id?: string; count?: number }>;
  total_items?: number;
  completed_runs_count?: number;
}

interface Props {
  group: Group;
  /** The shopping history lists the same groups by how many trips they hold; those cards are read-only. */
  history?: boolean;
}

/** A group of shopping lists: its card, the inline rename form and the delete confirmation. */
export function GroupCard({ group, history = false }: Props) {
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

  const listsCount = group.base_lists
    ? (group.base_lists[0]?.count ?? 0)
    : null;

  const handleUpdate = async ({ name, second }: EntityEditValues) => {
    try {
      const { error } = await updateGroup(group.id, {
        name: name.trim(),
        description: second,
      });
      if (error) throw new Error(error);
      const updatedName = name.trim();
      const updatedDescription = second;
      const changed =
        updatedName !== group.name ||
        updatedDescription !== (group.description ?? "");
      setEditing(false);
      if (changed) {
        router.refresh();
        focusEntityMenuWhenReady({
          cardTestId: `group-card-${group.id}`,
          title: updatedName,
          description: updatedDescription,
        });
      }
      toast.success("Group updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update group",
      );
      throw err;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await deleteGroup(group.id);
      if (error) throw new Error(error);
      router.refresh();
      toast.success("Group deleted");
      setShowDelete(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete group",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <EntityEditCard
        title="Edit Group"
        secondLabel="Description"
        secondPlaceholder="Add a description for this group"
        secondMax={500}
        initial={{ name: group.name, second: group.description ?? "" }}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        testId={`group-edit-${group.id}`}
      />
    );
  }

  return (
    <>
      <EntityCard
        href={
          history
            ? `/shopping-history/${group.id}`
            : `/shopping-lists/${group.id}/lists`
        }
        icon={Folder01Icon}
        title={group.name}
        description={group.description}
        count={history ? (group.completed_runs_count ?? null) : listsCount}
        unit={
          history
            ? { one: "shopping session", many: "shopping sessions" }
            : { one: "list", many: "lists" }
        }
        emptyLabel={history ? "shopping sessions" : "lists"}
        linkLabel={history ? "View History" : "View Lists"}
        menu={
          history
            ? undefined
            : {
                label: `More options for ${group.name}`,
                editLabel: "Edit Group",
                deleteLabel: "Delete Group",
                onEdit: () => setEditing(true),
                onDelete: () => setShowDelete(true),
              }
        }
        menuTriggerRef={menuTriggerRef}
        testId={`group-card-${group.id}`}
      />
      {history ? null : (
        <ConfirmSheet
          open={showDelete}
          onOpenChange={setShowDelete}
          title={`Delete “${group.name}”?`}
          consequence={
            listsCount !== null && listsCount > 0 ? (
              <>
                This also deletes its{" "}
                <b className="font-mono font-semibold">{listsCount}</b>{" "}
                {listsCount === 1 ? "list" : "lists"} and every item in them. It
                can’t be undone.
              </>
            ) : (
              "This group will be deleted. It can’t be undone."
            )
          }
          confirmLabel="Delete Group"
          loadingLabel="Deleting…"
          tone="danger"
          loading={deleting}
          onConfirm={handleDelete}
          testId={`group-delete-${group.id}`}
        />
      )}
    </>
  );
}
