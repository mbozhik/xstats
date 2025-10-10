import {cn} from '@/lib/utils'

import React from 'react'

type Props = {
  type: Typo
  className?: string
  children: React.ReactNode
}

export type Typo = keyof typeof TYPO_CLASSES

export const TYPO_CLASSES = {
  h1: 'text-2xl !leading-[1.1] font-semibold font-sans tracking-[-0.02em]',
  h4: 'text-base !leading-[1.2] font-semibold font-sans tracking-[-0.02em]',
  span: 'text-sm !leading-[1.2] font-mono tracking-[-0.01em]',
  small: 'text-xs !leading-[1.3] font-mono tracking-[-0.01em]',
} as const

export const H1 = createTypography('h1')
export const H4 = createTypography('h4')
export const SPAN = createTypography('span')
export const SMALL = createTypography('small')

function Typography({type, className, children, ...props}: Props) {
  const Element = type

  return (
    <Element className={cn(TYPO_CLASSES[type], ['span', 'small'].includes(type) && 'block', className)} {...props}>
      {children}
    </Element>
  )
}

function createTypography(type: Typo) {
  const Component = ({className, children, ...props}: Omit<Props, 'type'>) => (
    <Typography type={type} className={className} {...props}>
      {children}
    </Typography>
  )
  Component.displayName = `Typography(${type.toUpperCase()})`
  return Component
}
