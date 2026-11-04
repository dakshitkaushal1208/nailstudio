import { LoaderCircle } from 'lucide-react';

// variant: primary | secondary | ghost | light (for dark surfaces) | link | danger
export function Button({ as: Tag = 'button', variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, className].filter(Boolean).join(' ');
  const props = Tag === 'button' ? { type: 'button', disabled: disabled || loading } : { 'aria-disabled': disabled || undefined };
  return (
    <Tag className={classes} {...props} {...rest}>
      {loading && <LoaderCircle className="spin" size={16} aria-hidden />}
      {children}
    </Tag>
  );
}
