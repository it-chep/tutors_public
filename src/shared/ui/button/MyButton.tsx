import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderSpinner } from '../spinner';
import classes from './myButton.module.scss';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const MyButton = ({
  children,
  className = '',
  disabled,
  isLoading = false,
  type = 'button',
  ...props
}: PropsWithChildren<MyButtonProps>) => (
  <button
    {...props}
    className={`${classes.button} ${className}`}
    disabled={disabled || isLoading}
    type={type}
  >
    {isLoading ? <LoaderSpinner color="#ffffff" /> : children}
  </button>
);
