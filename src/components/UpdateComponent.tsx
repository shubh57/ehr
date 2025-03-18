// src/components/UpdateComponent.tsx

// Dependencies
import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Alert, useTheme } from '@mui/material';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

interface UpdateInfo {
    version: string;
    body?: string;
    downloadAndInstall: (callback: (event: any) => void) => Promise<void>;
}

const UpdateComponent: React.FC = () => {
    const theme = useTheme();

    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const update = await check();
                console.log('Update: ', update);
                if (update) {
                    setUpdateInfo(update as UpdateInfo);
                    setSnackbarOpen(true);
                }
            } catch (error) {
                console.error('Error while fetching updates: ', error);
            }
        };

        checkForUpdates();
    }, []);

    const handleUpdate = async () => {
        if (!updateInfo) return;
        setIsUpdating(true);
        try {
            let downloaded = 0;
            let contentLength = 0;
            await updateInfo.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength || 0;
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        // Optionally update a progress bar or log progress
                        break;
                    case 'Finished':
                        break;
                    default:
                        break;
                }
            });
            setSnackbarOpen(false);
            // Optional: Prompt user for restart after update
            if (window.confirm(`Version ${updateInfo.version} has been downloaded. Restart now?`)) {
                await relaunch();
            }
        } catch (error) {
            console.error('Error during update process: ', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Snackbar
                open={snackbarOpen}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Change to { horizontal: "left" } if preferred.
                sx={{
                    backgroundColor: theme.palette.paperYellow.light,
                }}
                onClose={() => setSnackbarOpen(false)}
                message={
                    <span>
                        Update available: {updateInfo?.version}. {updateInfo?.body && `Notes: ${updateInfo.body}`}
                    </span>
                }
                action={
                    <>
                        <Button color='secondary' size='small' onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? 'Updating...' : 'Update'}
                        </Button>
                        <Button color='inherit' size='small' onClick={() => setSnackbarOpen(false)}>
                            Later
                        </Button>
                    </>
                }
            />
        </>
    );
};

export default UpdateComponent;
