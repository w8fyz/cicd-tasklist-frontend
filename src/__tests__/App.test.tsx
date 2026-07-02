import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');
const mockApi = vi.mocked(taskApi);

const tasks: Task[] = [
	{
		id: 1,
		title: 'Tâche en cours',
		description: null,
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Tâche terminée',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the header and the loaded tasks with stats', async () => {
		mockApi.getTasks.mockResolvedValue(tasks);

		render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByText('Tâche en cours')).toBeInTheDocument()
		);
		expect(screen.getByText('Tâche terminée')).toBeInTheDocument();
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('En cours')).toBeInTheDocument();
	});

	it('adds a task through the form', async () => {
		mockApi.getTasks.mockResolvedValue([]);
		const created: Task = {
			id: 3,
			title: 'Nouvelle tâche',
			description: null,
			completed: false,
			createdAt: '2026-01-17T10:00:00Z',
			updatedAt: '2026-01-17T10:00:00Z',
		};
		mockApi.createTask.mockResolvedValue(created);

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: 'Nouvelle tâche' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		await waitFor(() =>
			expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument()
		);
		expect(mockApi.createTask).toHaveBeenCalledWith({ title: 'Nouvelle tâche' });
	});

	it('does not crash when creating a task fails', async () => {
		mockApi.getTasks.mockResolvedValue([]);
		mockApi.createTask.mockRejectedValue(new Error('HTTP 500'));

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: 'Va échouer' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		await waitFor(() => expect(mockApi.createTask).toHaveBeenCalled());
		expect(screen.getByTestId('empty')).toBeInTheDocument();
	});
});
