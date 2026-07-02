import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
	{
		id: 1,
		title: 'Première tâche',
		description: 'Description 1',
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Deuxième tâche',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

function renderTaskList(props: Partial<React.ComponentProps<typeof TaskList>> = {}) {
	const defaultProps = {
		tasks: [] as Task[],
		loading: false,
		error: null as string | null,
		onToggle: vi.fn(),
		onDelete: vi.fn(),
		onEdit: vi.fn(),
	};
	return render(<TaskList {...defaultProps} {...props} />);
}

describe('TaskList', () => {
	it('shows loading state', () => {
		renderTaskList({ loading: true });
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.getByText('Chargement des tâches...')).toBeInTheDocument();
	});

	it('renders list of tasks', () => {
		renderTaskList({ tasks: mockTasks });
		expect(screen.getByTestId('task-list')).toBeInTheDocument();
		expect(screen.getByText('Première tâche')).toBeInTheDocument();
		expect(screen.getByText('Deuxième tâche')).toBeInTheDocument();
		expect(screen.getByText('2 tâches')).toBeInTheDocument();
	});

	it('shows error state', () => {
		renderTaskList({ error: 'Connexion refusée' });
		expect(screen.getByTestId('error')).toBeInTheDocument();
		expect(screen.getByText('Erreur : Connexion refusée')).toBeInTheDocument();
	});

	it('shows empty state when there are no tasks', () => {
		renderTaskList({ tasks: [] });
		expect(screen.getByTestId('empty')).toBeInTheDocument();
		expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
	});

	it('shows the number of completed tasks', () => {
		renderTaskList({ tasks: mockTasks });
		expect(screen.getByText('1 terminée')).toBeInTheDocument();
	});

	it('calls onToggle when a task checkbox is clicked', () => {
		const onToggle = vi.fn();
		renderTaskList({ tasks: mockTasks, onToggle });

		const checkbox = screen.getByLabelText(
			'Marquer "Première tâche" comme terminée'
		);
		fireEvent.click(checkbox);

		expect(onToggle).toHaveBeenCalledWith(1);
	});
});
