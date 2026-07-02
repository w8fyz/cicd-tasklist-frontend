import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');
const mockApi = vi.mocked(taskApi);

function makeTask(id: number, overrides: Partial<Task> = {}): Task {
	return {
		id,
		title: `Tâche ${id}`,
		description: null,
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
		...overrides,
	};
}

describe('useTasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks on mount', async () => {
		const tasks = [makeTask(1), makeTask(2)];
		mockApi.getTasks.mockResolvedValue(tasks);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual(tasks);
		expect(result.current.error).toBeNull();
	});

	it('exposes the error message when loading fails', async () => {
		mockApi.getTasks.mockRejectedValue(new Error('Connexion refusée'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Connexion refusée');
		expect(result.current.tasks).toEqual([]);
	});

	it('addTask prepends the created task', async () => {
		mockApi.getTasks.mockResolvedValue([makeTask(1)]);
		const created = makeTask(2, { title: 'Nouvelle' });
		mockApi.createTask.mockResolvedValue(created);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Nouvelle' });
		});

		expect(mockApi.createTask).toHaveBeenCalledWith({ title: 'Nouvelle' });
		expect(result.current.tasks.map((t) => t.id)).toEqual([2, 1]);
	});

	it('editTask replaces the updated task', async () => {
		mockApi.getTasks.mockResolvedValue([makeTask(1), makeTask(2)]);
		const updated = makeTask(1, { title: 'Modifiée' });
		mockApi.updateTask.mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Modifiée' });
		});

		expect(mockApi.updateTask).toHaveBeenCalledWith(1, { title: 'Modifiée' });
		expect(result.current.tasks[0].title).toBe('Modifiée');
		expect(result.current.tasks[1].title).toBe('Tâche 2');
	});

	it('removeTask removes the task from the list', async () => {
		mockApi.getTasks.mockResolvedValue([makeTask(1), makeTask(2)]);
		mockApi.deleteTask.mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(mockApi.deleteTask).toHaveBeenCalledWith(1);
		expect(result.current.tasks.map((t) => t.id)).toEqual([2]);
	});

	it('toggleComplete inverts the completed flag', async () => {
		mockApi.getTasks.mockResolvedValue([makeTask(1, { completed: false })]);
		const toggled = makeTask(1, { completed: true });
		mockApi.updateTask.mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(mockApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});

	it('toggleComplete does nothing for an unknown id', async () => {
		mockApi.getTasks.mockResolvedValue([makeTask(1)]);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(mockApi.updateTask).not.toHaveBeenCalled();
	});
});
