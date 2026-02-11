import { render, screen } from '@testing-library/react';
import App from './App';

test('renders deal deck button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /deal deck/i });
  expect(button).toBeInTheDocument();
});
