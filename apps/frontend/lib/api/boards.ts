import { BOARD_API } from '@repo/config';
import { apiRequest } from './client';
import type { Board } from '../types';

const normalizeBoard = (board: any): Board => ({
  id: String(board.id ?? board._id ?? board.boardId ?? `${board.name ?? 'board'}-${Math.random()}`),
  name: board.name ?? 'Untitled board',
  description: board.description ?? '',
  organizationId: board.organizationId ?? board.orgId ?? board.organization?.id,
});

export async function listBoards(): Promise<Board[]> {
  const data = await apiRequest<any>(BOARD_API.list);
  const boards = Array.isArray(data) ? data : data.boards ?? data.board ?? data.data ?? [];
  return Array.isArray(boards) ? boards.map(normalizeBoard) : [];
}

export async function createBoard(name: string, organizationId: string): Promise<Board> {
  const data = await apiRequest<any>(BOARD_API.create, {
    method: 'POST',
    body: JSON.stringify({ name, organizationId }),
  });

  return normalizeBoard(data.board ?? data.data ?? data);
}
