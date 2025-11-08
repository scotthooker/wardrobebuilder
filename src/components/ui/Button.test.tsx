import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByText('Click me'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByText('Click me')

    expect(button).toBeDisabled()
  })

  it('shows loading spinner when loading prop is true', () => {
    render(<Button loading>Click me</Button>)
    const button = screen.getByText('Click me')

    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('renders left icon', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">→</span>}>
        Click me
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(
      <Button rightIcon={<span data-testid="right-icon">←</span>}>
        Click me
      </Button>
    )

    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary-600')

    rerender(<Button variant="success">Success</Button>)
    expect(screen.getByText('Success')).toHaveClass('bg-green-600')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByText('Outline')).toHaveClass('bg-white')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText('Ghost')).toHaveClass('bg-transparent')

    rerender(<Button variant="premium">Premium</Button>)
    expect(screen.getByText('Premium')).toHaveClass('bg-gradient-to-r')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByText('Medium')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('applies full width when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByText('Full Width')).toHaveClass('w-full')
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    const button = screen.getByText('Click me')

    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-primary-600') // Still has default variant class
  })
})
