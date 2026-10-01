import { HTMLAttributes, PropsWithChildren } from 'react';
import classes from './surfaceBlock.module.scss';

interface SurfaceBlockProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'compact';
}

export const SurfaceBlock = ({
  children,
  className = '',
  variant = 'default',
  ...props
}: PropsWithChildren<SurfaceBlockProps>) => (
  <section
    {...props}
    className={`${classes.surfaceBlock}${variant === 'compact' ? ` ${classes.compact}` : ''}${className ? ` ${className}` : ''}`}
  >
    {children}
  </section>
);
