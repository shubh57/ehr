import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { THEME_ID, ThemeProvider } from '@mui/material/styles';
import chakraTheme from './theme/chakraTheme';
import muiTheme from './theme/muiTheme';
import { ConfirmProvider } from 'material-ui-confirm';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { attachConsole } from '@tauri-apps/plugin-log';
import { QueryClient, QueryClientProvider } from 'react-query';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
attachConsole();

const queryClient = new QueryClient();

root.render(
    <ChakraProvider theme={chakraTheme} resetCSS>
        <ThemeProvider theme={{ [THEME_ID]: muiTheme }}>
            <Provider store={store}>
                <ConfirmProvider>
                    <BrowserRouter>
                        <QueryClientProvider client={queryClient}>
                            <App />
                        </QueryClientProvider>
                    </BrowserRouter>
                </ConfirmProvider>
            </Provider>
        </ThemeProvider>
    </ChakraProvider>,
);
