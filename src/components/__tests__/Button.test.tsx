import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../button';

describe('Button', () => {
  it('renders with default text when no props provided', () => {
    render(<Button />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Crear partida')).toBeInTheDocument();
  });

  it('renders with button1 text', () => {
    render(<Button button1="Ingresar" />);
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });

  it('renders with label text as fallback', () => {
    render(<Button label="Ver más" />);
    expect(screen.getByText('Ver más')).toBeInTheDocument();
  });

  it('button1 takes precedence over label', () => {
    render(<Button button1="Ingresar" label="Ver más" />);
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.queryByText('Ver más')).not.toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button button1="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not throw when clicked without onClick handler', () => {
    render(<Button button1="No handler" />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  it('renders with type="button" when specified', () => {
    render(<Button button1="Cancel" type="button" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders with type="submit" by default', () => {
    render(<Button button1="Submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('applies custom background color via style', () => {
    render(<Button button1="Styled" button1BackgroundColor="#ff0000" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ backgroundColor: '#ff0000' });
  });
});
