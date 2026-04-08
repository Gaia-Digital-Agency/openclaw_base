import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      aria-label="Hutton Service"
      className={clsx(
        'inline-flex h-[34px] items-center text-lg font-semibold uppercase tracking-[0.18em] text-slate-900',
        className,
      )}
    >
      Hutton Service
    </span>
  )
}
