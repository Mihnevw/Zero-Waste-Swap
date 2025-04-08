import React from 'react';
import { TextField, InputAdornment, IconButton, SxProps, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
  variant?: 'home' | 'search';
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSearch,
  placeholder = 'Search...', 
  sx,
  variant = 'search'
}) => {
  const getVariantStyles = (theme: Theme): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      '& .MuiInputBase-root': {
        backgroundColor: variant === 'home' ? 'rgba(255, 255, 255, 0.9)' : '#ffffff',
        backdropFilter: variant === 'home' ? 'blur(4px)' : 'none',
        borderRadius: 2,
        border: variant === 'home' 
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: variant === 'home' ? 'rgba(255, 255, 255, 1)' : '#ffffff',
          border: variant === 'home'
            ? '1px solid rgba(255, 255, 255, 0.5)'
            : `1px solid ${theme.palette.primary.main}`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        '&.Mui-focused': {
          backgroundColor: variant === 'home' ? 'rgba(255, 255, 255, 1)' : '#ffffff',
          border: variant === 'home'
            ? '2px solid rgba(255, 255, 255, 0.8)'
            : `2px solid ${theme.palette.primary.main}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        }
      },
      '& .MuiInputBase-input': {
        padding: '16px',
        fontSize: '1.1rem',
        color: theme.palette.text.primary,
        '&::placeholder': {
          color: theme.palette.text.secondary,
          opacity: 0.8
        }
      },
      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        fontSize: '1.5rem',
        color: theme.palette.primary.main,
        marginLeft: '8px'
      }
    };

    return baseStyles;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && value.trim()) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch && value.trim()) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        sx={(theme) => ({
          ...getVariantStyles(theme),
          ...(sx && typeof sx === 'function' ? sx(theme) : sx)
        })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                type="submit"
                aria-label="search"
                onClick={() => onSearch && value.trim() && onSearch(value)}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 125, 50, 0.04)'
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
};

export default SearchBar; 