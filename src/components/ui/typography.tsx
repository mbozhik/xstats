import {cn} from '@/lib/utils'

import React from 'react'

type Props = {
  type: Typo
  className?: string
  children: React.ReactNode
}

export type Typo = keyof typeof TYPO_CLASSES

export const TYPO_CLASSES = {
  h1: 'text-2xl !leading-[1.1] font-semibold font-sans',
  h2: 'text-xl !leading-[1.1] font-semibold font-sans',
  h3: 'text-lg !leading-[1.1] font-semibold font-sans',
  p: 'text-base !leading-[1.3] font-sans',
  span: 'text-sm !leading-[1.2] font-mono',
  small: 'text-xs !leading-[1.3] font-mono',
} as const

export const H1 = createTypography('h1')
export const H2 = createTypography('h2')
export const H3 = createTypography('h3')
export const P = createTypography('p')
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
