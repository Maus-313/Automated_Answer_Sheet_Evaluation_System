import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Evaluator from './Evaluator';

// Mock fetch
global.fetch = jest.fn();

describe('Evaluator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders evaluator and handles slot selection', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    render(<Evaluator />);

    const slotSelect = screen.getByLabelText(/Slot/i);
    expect(slotSelect).toBeInTheDocument();

    fireEvent.change(slotSelect, { target: { value: 'F1' } });
    expect(slotSelect).toHaveValue('F1');
  });

  it('loads QPs and answers for selected slot', async () => {
    const mockQps = [{ subject: 'Math', slot: 'F1', courseCode: 'CS101', examType: 'MID', questions: [] }];
    const mockAnswers = [{ rollNo: '123', name: 'John', slot: 'F1', examType: 'MID', totalMarks: 0 }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockQps }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockAnswers }),
      });

    render(<Evaluator />);

    const slotSelect = screen.getByLabelText(/Slot/i);
    fireEvent.change(slotSelect, { target: { value: 'F1' } });

    await waitFor(() => {
      expect(screen.getByText('CS101 • Math')).toBeInTheDocument();
    });

    expect(screen.getByText('123 • John')).toBeInTheDocument();
  });

  it('handles evaluation with selected answers', async () => {
    const mockQps = [{ subject: 'Math', slot: 'F1', courseCode: 'CS101', examType: 'MID', questions: [{ no: 1, text: 'Q1' }] }];
    const mockAnswers = [{ rollNo: '123', name: 'John', slot: 'F1', examType: 'MID', totalMarks: 0, answer1: 'Ans' }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockQps }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockAnswers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }), // MS
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [{ rollNo: '123', marks: { answer1: 5 }, totalMarks: 5 }] }),
      });

    render(<Evaluator />);

    const slotSelect = screen.getByLabelText(/Slot/i);
    fireEvent.change(slotSelect, { target: { value: 'F1' } });

    await waitFor(() => {
      expect(screen.getByText('CS101 • Math')).toBeInTheDocument();
    });

    const qpSelect = screen.getByDisplayValue(''); // QP select
    fireEvent.change(qpSelect, { target: { value: '0' } });

    const checkbox = screen.getByLabelText('123 • John');
    fireEvent.click(checkbox);

    const evaluateButton = screen.getByText('Evaluate');
    fireEvent.click(evaluateButton);

    await waitFor(() => {
      expect(screen.getByText('Evaluation Summary')).toBeInTheDocument();
    });
  });
});