// src/components/UpdateComponent.tsx

// Dependencies
import { Button } from "@mui/material";
import { check } from "@tauri-apps/plugin-updater";
import { useConfirm } from "material-ui-confirm";
import { relaunch } from '@tauri-apps/plugin-process';
import React, { useEffect } from "react";

const UpdateComponent: React.FC = () => {
    const confirm = useConfirm();

    const checkForUpdates = async () => {
        try {
            const update = await check();
            console.log("update: ", update);
            if (!update) {
                return;
            }

            const { confirmed } = await confirm({
                title: 'Update Available',
                description: `Version ${update.version} is available. Release notes: ${update.body}. Would you like to update now?`,
                confirmationText: 'Update',
                cancellationText: 'Later',
            });

            if (!confirmed) {
                return;
            }

            let downloaded = 0;
            let contentLength = 0;

            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength || 0;
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        break;
                    case 'Finished':
                        break;
                    default:
                        break;
                }
            });

            const { confirmed: relaunchConfirmed } = await confirm(
                {
                    title: 'Restart Application Now?',
                    description: `Version ${update.version} is downloaded. Release notes: ${update.body}. Would you like to restart the application now?`,
                    confirmationText: 'Restart',
                    cancellationText: 'Later',
                }
            );

            if (relaunchConfirmed) {
                await relaunch();
            }
        } catch (error) {
            console.error("Error while fetching updates: ", error);
        }
    };

    useEffect(() => {
        checkForUpdates();
    }, []);

    return (
        <></>
    );
};

export default UpdateComponent;