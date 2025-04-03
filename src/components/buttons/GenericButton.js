import { Button } from 'primereact/button';
import useWindowWidth from '@/hooks/useWindowWidth';

const GenericButton = ({
  label,
  icon,
  onClick,
  severity,
  size,
  className,
  outlined = false,
  rounded = false,
  disabled = false,
  tooltip = null,
  tooltipOptions = null,
  iconPos = 'left',
}) => {
  const windowWidth = useWindowWidth();
  return (
    <Button
      label={label}
      icon={icon}
      iconPos={iconPos}
      onClick={onClick}
      severity={severity}
      size={size || (windowWidth < 768 ? 'small' : 'normal')}
      className={className}
      outlined={outlined}
      rounded={rounded}
      disabled={disabled}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
    />
  );
};

export default GenericButton;
