import { ReactNode } from 'react';
import { MyButton } from '../button';
import { SurfaceBlock } from '../surfaceBlock';
import { LoaderSpinner } from '../spinner';
import classes from './pageState.module.scss';

interface LoadingStateProps {
  text?: string;
}

export const LoadingState = ({ text = 'Загружаем информацию…' }: LoadingStateProps) => (
  <SurfaceBlock className={classes.state} role="status">
    <LoaderSpinner />
    <p>{text}</p>
  </SurfaceBlock>
);

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <SurfaceBlock className={classes.state}>
    <h2>{title}</h2>
    <p>{description}</p>
  </SurfaceBlock>
);

interface ErrorStateProps extends EmptyStateProps {
  onRetry: () => void;
  retryLabel?: ReactNode;
}

export const ErrorState = ({ title, description, onRetry, retryLabel = 'Повторить' }: ErrorStateProps) => (
  <SurfaceBlock className={`${classes.state} ${classes.error}`} role="alert">
    <h2>{title}</h2>
    <p>{description}</p>
    <MyButton className={classes.retry} onClick={onRetry}>{retryLabel}</MyButton>
  </SurfaceBlock>
);
