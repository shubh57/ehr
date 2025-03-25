// src/components/doctor-dashboard/WeatherWidget.tsx

// Dependencies
import { Box, Typography, CircularProgress, Skeleton } from '@mui/material';
import { useState, useEffect } from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useTheme } from '@mui/material/styles';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const fetchUserLocationByIp = async (): Promise<{lat: number, long: number, location: string}> => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ip = data.ip;

    // Then use it to get location information
    const locationResponse = await fetch(`https://api.geoapify.com/v1/ipinfo?ip=${ip}&apiKey=a21a54669b8f4ddcafdb7f27f287b679`);
    const locationData = await locationResponse.json();

    return { lat: locationData?.location?.latitude, long: locationData?.location?.longitude, location: locationData?.city?.name };
};

const fetchWeather = async (lat: number, lon: number, location: string): Promise<{condition: string, temperature: string, location: string}> => {
    const apiKey = '105c37a85acf04c0265486c669d39389'; // Replace with your API key
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather');
    }

    const condition = data.weather[0].main;
    const temperature = `${Math.round(data.main.temp)}°C`;

    return { condition, temperature, location };
};

const WeatherWidget = () => {
    const theme = useTheme();
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [weather, setWeather] = useState<{ condition: string; temperature: string; location: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const locationQuery = useQuery<{lat: number, long: number, location: string}, Error>(['location', user?.user_id], () => fetchUserLocationByIp());
    const weatherQuery = useQuery<{condition: string, temperature: string, location: string}, Error>(['weather', user?.user_id], () => fetchWeather(locationQuery?.data?.lat || 0, locationQuery?.data?.long || 0, locationQuery?.data?.location || ""));
    const loading = locationQuery.isLoading || weatherQuery.isLoading;

    useEffect(() => {
        if (weatherQuery.data) {
            setWeather(weatherQuery.data);
        }
    }, [weatherQuery.data]);

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'Clear':
                return <WbSunnyIcon fontSize='large' color='warning' />;
            case 'Clouds':
                return <CloudIcon fontSize='large' color='primary' />;
            case 'Snow':
                return <AcUnitIcon fontSize='large' color='info' />;
            default:
                return <WbSunnyIcon fontSize='large' color='warning' />;
        }
    };

    return (
        <Box
            sx={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
            }}
        >
            {loading ? (
                <>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={100} height={24} />
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={120} height={16} />
                </>
            ) : error ? (
                <Typography variant='body1' color='error'>
                    {error}
                </Typography>
            ) : (
                <>
                    {getWeatherIcon(weather?.condition || "")}
                    <Typography variant='h6'>{weather?.condition}</Typography>
                    <Typography variant='body1'>{weather?.temperature}</Typography>
                    <Typography variant='body2'>📍 {weather?.location}</Typography>
                </>
            )}
        </Box>
    );
};

export default WeatherWidget;
