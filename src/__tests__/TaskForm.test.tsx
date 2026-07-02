import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders the create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByText('Ajouter')).toBeInTheDocument();
	});

	it('submits title and description', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: 'Ma tâche' },
		});
		fireEvent.change(screen.getByLabelText('Description'), {
			target: { value: 'Une description' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: 'Une description',
		});
	});

	it('trims the title and omits an empty description', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: '  Ma tâche  ' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: undefined,
		});
	});

	it('shows a validation error when the title is empty', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('clears the fields after a successful create', () => {
		render(<TaskForm onSubmit={vi.fn()} />);

		const titleInput = screen.getByLabelText('Titre') as HTMLInputElement;
		fireEvent.change(titleInput, { target: { value: 'Ma tâche' } });
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(titleInput.value).toBe('');
	});

	it('renders the edit form with initial values and cancel button', () => {
		const onCancel = vi.fn();
		render(
			<TaskForm
				onSubmit={vi.fn()}
				onCancel={onCancel}
				mode="edit"
				initialValues={{ title: 'Titre existant', description: 'Desc' }}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect((screen.getByLabelText('Titre') as HTMLInputElement).value).toBe(
			'Titre existant'
		);

		fireEvent.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});
});
