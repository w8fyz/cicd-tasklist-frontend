import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

function mockFetchOnce(response: Partial<Response>) {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve([mockTask]),
		} as Response);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTasks throws on HTTP error', async () => {
		mockFetchOnce({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal Server Error'),
		} as Response);

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('getTask fetches a single task by id', async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve(mockTask),
		} as Response);

		const task = await getTask(1);
		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('createTask sends a POST request with a JSON body', async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve(mockTask),
		} as Response);

		const task = await createTask({ title: 'Test' });

		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Test' }),
		});
	});

	it('updateTask sends a PUT request to the task URL', async () => {
		const updated = { ...mockTask, completed: true };
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve(updated),
		} as Response);

		const task = await updateTask(1, { completed: true });

		expect(task).toEqual(updated);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ completed: true }),
		});
	});

	it('deleteTask sends a DELETE request', async () => {
		mockFetchOnce({ ok: true } as Response);

		await deleteTask(1);

		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
	});

	it('deleteTask throws on HTTP error', async () => {
		mockFetchOnce({
			ok: false,
			status: 404,
			text: () => Promise.resolve('Task not found'),
		} as Response);

		await expect(deleteTask(999)).rejects.toThrow('HTTP 404');
	});
});
