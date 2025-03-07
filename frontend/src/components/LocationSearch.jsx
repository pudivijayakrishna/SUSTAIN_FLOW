import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Autocomplete, 
    CircularProgress, 
    Box,
    Alert
} from '@mui/material';
import debounce from 'lodash/debounce';

const LocationSearch = ({ onLocationSelect, initialValue }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        if (initialValue) {
            if (typeof initialValue === 'string' && initialValue.includes(',')) {
                // Handle legacy format (lat,lon)
                const [lat, lon] = initialValue.split(',').map(Number);
                setSelectedLocation({
                    label: `${lat},${lon}`,
                    position: { lat, lon }
                });
                setInputValue(`${lat},${lon}`);
            } else if (initialValue.label && initialValue.position) {
                // Handle object format
                setSelectedLocation(initialValue);
                setInputValue(initialValue.label);
            }
        }
    }, [initialValue]);

    const searchLocations = debounce(async (query) => {
        if (!query) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=ckGqeLuYJANYC1mBlep5STB96iHf2CcQ&countrySet=IN&limit=5`
            );
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many requests. Please try again in a moment.');
                }
                throw new Error('Failed to fetch locations');
            }

            const data = await response.json();
            
            if (data.results) {
                const locations = data.results.map(result => ({
                    label: result.address.freeformAddress,
                    position: result.position
                }));
                setOptions(locations);
            }
        } catch (error) {
            console.error('Error searching locations:', error);
            setError(error.message);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, 1000);

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
        if (newInputValue.length >= 3) {
            searchLocations(newInputValue);
        }
    };

    const handleLocationSelect = (event, newValue) => {
        setSelectedLocation(newValue);
        if (onLocationSelect && newValue) {
            onLocationSelect(newValue);
        }
    };

    return (
        <Box>
            <Autocomplete
                value={selectedLocation}
                onChange={handleLocationSelect}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                options={options}
                loading={loading}
                getOptionLabel={(option) => option?.label || ''}
                isOptionEqualToValue={(option, value) => 
                    option?.label === value?.label && 
                    option?.position?.lat === value?.position?.lat && 
                    option?.position?.lon === value?.position?.lon
                }
                noOptionsText={error ? "Error loading locations" : "No locations found"}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Location"
                        variant="outlined"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
            {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default LocationSearch;