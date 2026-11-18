"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ConfirmSheet,
  EntityCard,
  EntityEditCard,
  EntityLabel,
  focusEntityMenuWhenReady,
  type EntityEditValues,
} from "@/components/commons";
import { ShareListDialog } from "@/components/features/sharing";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StartShoppingDialog } from "./start-shopping-dialog";
import { deleteBaseList, updateBaseList } from "@/lib/api/endpoints";

import type { BaseListWithCount } from "@/types";

import { buildListCardFacts, buildSharedWithLabel } from "./helpers/list-card-meta";
import { getListCardMenuActions } from "./helpers/get-list-card-menu-actions";
import { splitCardStores, type ListCardStore } from "./helpers/list-card-stores";

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
  /** The stores the list's items are usually bought at, the most used first; the card draws the first few and counts the rest. */
  stores?: ListCardStore[];
}

/** A base list: its card, the inline rename form, the share sheet and the immediate delete confirmation. */
export function BaseListCard({
  baseList,
  displayName,
  activeSessionId,
  isDefault = false,
  lastTripAt,
  sharedWithCount,
  stores = [],
}: Props) {
  const shownName = displayName ?? baseList.name;
  const sharedWith = buildSharedWithLabel(sharedWithCount);
  const { shown: shownStores, hiddenCount: hiddenStoreCount } = splitCardStores(stores);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
    if (deleting || activeSessionId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteBaseList(baseList.id);
      if (result.error) {
        setDeleteError(result.errorCode === 'CONFLICT'
          ? 'This list has an active trip. Finish or cancel the trip before deleting the list.'
          : 'Could not delete this list. Check your connection and try again.');
        toast.error(result.errorCode === 'CONFLICT' ? 'List is in an active trip' : 'Could not delete list', {
          description: result.errorCode === 'CONFLICT' ? 'Finish or cancel the trip before deleting the list.' : 'Check your connection and try again.',
        });
        setDeleting(false);
        return;
      }
      toast.success('List deleted');
      router.push('/shopping-lists');
      router.refresh();
    } catch {
      setDeleteError('Could not delete this list. Check your connection and try again.');
      toast.error('Could not delete list', { description: 'Check your connection and try again.' });
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <EntityEditCard
        title="Edit List"
        secondLabel="Notes"
        secondPlaceholder="Description or notes, eg. “Weekly groceries”, “Items for camping trip”"
        secondMax={500}
        initial={{ name: baseList.name, second: baseList.notes ?? "" }}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        testId={`list-edit-${baseList.id}`}
      />
    );
  }

  const menuActions = getListCardMenuActions({
    hasActiveTrip: Boolean(activeSessionId),
    onEdit: () => setEditing(true),
    onShare: () => setShowShare(true),
    onDelete: () => { setDeleteError(null); setShowDelete(true) },
  });

  return (
    <>
      <EntityCard
        href={`/base-lists/${baseList.id}/edit`}
        title={shownName}
        description={baseList.notes}
        badge={
          isDefault || sharedWith || shownStores.length > 0 ? (
            <>
              {isDefault ? (
                <Badge variant="outline" data-testid={`list-card-${baseList.id}-default`}>
                  <HugeiconsIcon icon={StarIcon} strokeWidth={1.8} aria-hidden="true" />
                  Default
                </Badge>
              ) : null}
              {sharedWith ? (
                <Badge variant="outline" data-testid={`list-card-${baseList.id}-shared`}>
                  <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.8} aria-hidden="true" />
                  {sharedWith}
                </Badge>
              ) : null}
              {shownStores.map((store) => (
                <EntityLabel
                  key={store.id}
                  name={store.name}
                  testId={`list-card-${baseList.id}-store-${store.id}`}
                />
              ))}
              {hiddenStoreCount > 0 ? (
                <Badge
                  variant="outline"
                  data-testid={`list-card-${baseList.id}-stores-more`}
                >
                  <span aria-hidden="true">+{hiddenStoreCount}</span>
                  <span className="sr-only">{hiddenStoreCount} more {hiddenStoreCount === 1 ? "store" : "stores"}</span>
                </Badge>
              ) : null}
            </>
          ) : null
        }
        facts={buildListCardFacts(lastTripAt)}
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
          actions: menuActions,
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
        title="Delete List?"
        description={
          baseList.items_count > 0 ? (
            <>
              <b className="font-semibold text-foreground">{shownName}</b> and its {baseList.items_count} {baseList.items_count === 1 ? "item" : "items"} will be deleted.
            </>
          ) : (
            <>
              <b className="font-semibold text-foreground">{shownName}</b> will be deleted.
            </>
          )
        }
        consequence="Past trips for this list are deleted, and shared members lose access."
        consequenceTitle="This can't be undone"
        consequenceTone="warning"
        confirmLabel="Delete List"
        loadingLabel="Deleting…"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        testId={`list-delete-${baseList.id}`}
      >
        {deleteError ? <Alert variant="destructive" data-testid={`list-delete-error-${baseList.id}`}><AlertTitle>Deletion failed</AlertTitle><AlertDescription>{deleteError}</AlertDescription></Alert> : null}
      </ConfirmSheet>
    </>
  );
}
