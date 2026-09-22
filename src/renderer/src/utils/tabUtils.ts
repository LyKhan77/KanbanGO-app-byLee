/**
 * Pure utility functions for multi-board tab state management.
 */

/**
 * Resolves the next active tab and updated open board IDs when a tab is closed or a board is deleted.
 *
 * Rules:
 * 1. If closed tab is not active, keep current active tab unchanged.
 * 2. If closed tab is active:
 *    - If no open tabs remain, nextActiveId is null.
 *    - Otherwise, advance to the tab at Math.min(closedIndex, updatedTabs.length - 1).
 */
export function resolveNextActiveTab(
  openBoardIds: string[],
  closedBoardId: string,
  currentActiveId: string | null
): { updatedTabs: string[]; nextActiveId: string | null } {
  const closedIndex = openBoardIds.indexOf(closedBoardId);
  const updatedTabs = openBoardIds.filter((id) => id !== closedBoardId);

  if (currentActiveId !== closedBoardId) {
    return { updatedTabs, nextActiveId: currentActiveId };
  }

  if (updatedTabs.length === 0) {
    return { updatedTabs: [], nextActiveId: null };
  }

  if (closedIndex === -1) {
    return { updatedTabs, nextActiveId: currentActiveId };
  }

  const nextIndex = Math.min(closedIndex, updatedTabs.length - 1);
  return { updatedTabs, nextActiveId: updatedTabs[nextIndex] };
}
