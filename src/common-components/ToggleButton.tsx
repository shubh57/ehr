import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const CustomToggleButton = ({
    selected,
    onChange,
    options,
}: {
    selected: string;
    onChange: (event: React.MouseEvent<HTMLElement>, newRange: string | null) => void;
    options: { label: string; value: string }[];
}) => {
    return (
        <ToggleButtonGroup
            value={selected}
            exclusive
            onChange={onChange}
            sx={{
                border: '1px solid black',
                width: '100%',
                borderRadius: '40px',
                height: '48px',
            }}
        >
            {options.map((option, index) => (
                <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{
                        textTransform: 'none',
                        width: `${100 / options.length}%`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        border: index === options.length - 1 || index === 0 ? 'none !important' : undefined,
                        borderTopLeftRadius: index === 0 ? '40px !important' : undefined,
                        borderBottomLeftRadius: index === 0 ? '40px !important' : undefined,
                        borderTopRightRadius: index === options.length - 1 ? '40px !important' : undefined,
                        borderBottomRightRadius: index === options.length - 1 ? '40px !important' : undefined,
                    }}
                >
                    {selected === option.value && (
                        <CheckIcon
                            fontSize='small'
                            sx={{
                                position: 'absolute',
                                left: '5px',
                            }}
                        />
                    )}
                    <span
                        style={{
                            marginLeft: selected === option.value ? '16px' : '0px',
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        {option.label}
                    </span>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default CustomToggleButton;
