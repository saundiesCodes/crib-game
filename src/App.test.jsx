import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start game button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /start game/i });
  expect(button).toBeInTheDocument();
});
