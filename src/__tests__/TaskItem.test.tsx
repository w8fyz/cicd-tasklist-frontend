import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function renderTaskItem(overrides: Partial<React.ComponentProps<typeof TaskItem>> = {}) {
	const props = {
		task,
		onToggle: vi.fn(),
		onDelete: vi.fn(),
		onEdit: vi.fn(),
		...overrides,
	};
	render(<TaskItem {...props} />);
	return props;
}

describe('TaskItem', () => {
	it('renders title and description', () => {
		renderTaskItem();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
	});

	it('calls onToggle when the checkbox is clicked', () => {
		const { onToggle } = renderTaskItem();
		fireEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('saves the edited title and description', () => {
		const { onEdit } = renderTaskItem();

		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: '  Titre modifié  ' },
		});
		fireEvent.change(screen.getByLabelText('Modifier la description'), {
			target: { value: 'Nouvelle description' },
		});
		fireEvent.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Nouvelle description',
		});
		expect(screen.queryByText('Enregistrer')).not.toBeInTheDocument();
	});

	it('does not save when the edited title is empty', () => {
		const { onEdit } = renderTaskItem();

		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: '   ' },
		});
		fireEvent.click(screen.getByText('Enregistrer'));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels editing and restores the initial values', () => {
		const { onEdit } = renderTaskItem();

		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: 'Abandonné' },
		});
		fireEvent.click(screen.getByText('Annuler'));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('asks for confirmation before deleting', () => {
		const { onDelete } = renderTaskItem();
		const deleteButton = screen.getByLabelText('Supprimer');

		fireEvent.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
