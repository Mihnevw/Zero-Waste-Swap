import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Search...', 
  fullWidth = true 
}: SearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <TextField
      fullWidth={fullWidth}
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={handleKeyPress}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'white' }} />
          </InputAdornment>
        ),
        sx: {
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        },
      }}
      sx={{
        '& .MuiInputBase-input::placeholder': {
          color: 'rgba(255, 255, 255, 0.7)',
          opacity: 1,
        },
      }}
    />
  );
};

export default SearchBar; 