import classes from './spinner.module.scss';

interface LoaderSpinnerProps {
  color?: string;
}

export const LoaderSpinner = ({ color }: LoaderSpinnerProps) => (
  <span aria-label="Загрузка" className={classes.loaderSpinner} style={color ? { background: color } : undefined} />
);
