import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles onChange events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'test')

    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')

    expect(input).toBeDisabled()
  })

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">$</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">%</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(<Input helperText="This is a helper text" />)
    expect(screen.getByText('This is a helper text')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<Input error helperText="This is an error" />)
    const input = screen.getByRole('textbox')
    const helperText = screen.getByText('This is an error')

    expect(input).toHaveClass('border-error-300')
    expect(helperText).toHaveClass('text-error-600')
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Input variant="default" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-gray-300')

    rerender(<Input variant="success" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-success-300')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Input inputSize="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Input inputSize="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<Input inputSize="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('px-5', 'py-3', 'text-lg')
  })

  it('handles number type', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input type="number" onChange={handleChange} />)
    const input = screen.getByRole('spinbutton')

    await user.type(input, '123')

    expect(input).toHaveValue(123)
  })

  it('merges custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('border-gray-300') // Still has default variant class
  })
})
