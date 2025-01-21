import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { THEME_ID, ThemeProvider } from '@mui/material/styles';
import chakraTheme from './theme/chakraTheme';
import muiTheme from './theme/muiTheme';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <ChakraProvider theme={chakraTheme} resetCSS>
        <ThemeProvider theme={{ [THEME_ID]: muiTheme }}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </ChakraProvider>,
);
