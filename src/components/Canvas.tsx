import { Box, Typography, Slider, Button, Paper } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile, BaseDirectory, readFile, create, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

interface CanvasProps {
    width?: number;
    height?: number;
}

const Canvas: React.FC<CanvasProps> = ({ width = window.innerWidth, height = window.innerHeight }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const navigate = useNavigate();
    const toast = useToast();
    const [inputDevice, setInputDevice] = useState<string>('Mouse');
    const [availableDevices, setAvailableDevices] = useState<string[]>([]);
    const [color, setColor] = useState<string>('black');
    const [lineWidth, setLineWidth] = useState<number>(2);
    const [eraserWidth, setEraserWidth] = useState<number>(20);
    const [eraseMode, setEraseMode] = useState<boolean>(false);
    const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

    const debounce = (func: Function, delay: number) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    useEffect(() => {
        const detectInputDevices = () => {
            const devices: string[] = [];
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                devices.push('Touch');
            }
            if (window.PointerEvent) {
                devices.push('Wacom Board');
            }
            devices.push('Mouse');
            setAvailableDevices(devices);
        };

        detectInputDevices();
    }, []);

    // Export the canvas drawing as an image
    const exportCanvas = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const fileName = 'canvas.png';

            const blob = await fetch(dataUrl).then((res) => res.blob());
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            await writeFile(fileName, uint8Array, { baseDir: BaseDirectory.AppLocalData });
        }
    };

    const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const autoSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const uint8Array = dataUrlToUint8Array(dataUrl);

        const dirPath = await join(BaseDirectory.AppData.toString(), 'com.ehrportal.app');
        const filePath = await join(dirPath, 'autosave.png');

        const dirExsits = await exists(dirPath);
        if (!dirExsits) {
            await mkdir(dirPath, { recursive: true });
        }

        await writeFile(filePath, uint8Array);
        // await writeFile("autosave.png", uint8Array, {baseDir: BaseDirectory.AppLocalData});

        toast({
            title: 'autosaved canvas',
            status: 'success',
            duration: 4000,
            position: 'top',
            isClosable: true,
        });
    };

    const autoSaveDebounced = debounce(autoSave, 1000);

    const loadSavedCanvas = async () => {
        try {
            const fileContent = await readFile('autosave.png', { baseDir: BaseDirectory.AppLocalData });

            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    context?.drawImage(img, 0, 0);
                }
            };

            const blob = new Blob([fileContent], { type: 'image/png' });
            img.src = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error while loading saved canvas: ', error);
        }
    };

    useEffect(() => {
        loadSavedCanvas();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineCap = 'round';

        const getCoordinates = (event: PointerEvent | MouseEvent | TouchEvent): { x: number; y: number } | null => {
            const rect = canvas.getBoundingClientRect();
            if ('touches' in event && event.touches.length > 0) {
                return {
                    x: event.touches[0].clientX - rect.left,
                    y: event.touches[0].clientY - rect.top,
                };
            }
            return 'clientX' in event ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : null;
        };

        const handlePointerDown = (event: PointerEvent | MouseEvent | TouchEvent) => {
            // Checking for the selected input device
            if (
                (inputDevice === 'Wacom Board' && 'pointerType' in event && event.pointerType !== 'pen') ||
                (inputDevice === 'Touch' && !(event instanceof TouchEvent)) ||
                (inputDevice === 'Mouse' && !(event instanceof MouseEvent))
            ) {
                return;
            }
            isDrawing.current = true;
            const coords = getCoordinates(event);
            if (coords) {
                lastPoint.current = coords;
                setPointerPos(coords);
            }
        };

        const handlePointerMove = (event: PointerEvent | MouseEvent | TouchEvent) => {
            const coords = getCoordinates(event);
            if (coords) {
                setPointerPos(coords);
            }

            if (!isDrawing.current || !lastPoint.current) return;
            if (
                (inputDevice === 'Wacom Board' && 'pointerType' in event && event.pointerType !== 'pen') ||
                (inputDevice === 'Touch' && !(event instanceof TouchEvent)) ||
                (inputDevice === 'Mouse' && !(event instanceof MouseEvent))
            ) {
                return;
            }
            if (!coords) return;

            context.beginPath();
            context.moveTo(lastPoint.current.x, lastPoint.current.y);
            context.lineTo(coords.x, coords.y);

            // Toggle between pen and eraser; in eraser mode we use destination-out [1][6]
            if (eraseMode) {
                context.globalCompositeOperation = 'destination-out';
                context.lineWidth = eraserWidth;
            } else {
                context.globalCompositeOperation = 'source-over';
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
            }
            context.stroke();
            lastPoint.current = coords;
        };

        const endDrawing = () => {
            isDrawing.current = false;
            lastPoint.current = null;

            autoSaveDebounced();
        };

        // Add appropriate event listeners based on the input device
        if (inputDevice === 'Touch') {
            canvas.addEventListener('touchstart', handlePointerDown as EventListener);
            canvas.addEventListener('touchmove', handlePointerMove as EventListener);
            canvas.addEventListener('touchend', endDrawing);
        } else {
            canvas.addEventListener('pointerdown', handlePointerDown as EventListener);
            canvas.addEventListener('pointermove', handlePointerMove as EventListener);
            canvas.addEventListener('pointerup', endDrawing);
        }

        return () => {
            canvas.removeEventListener('touchstart', handlePointerDown as EventListener);
            canvas.removeEventListener('touchmove', handlePointerMove as EventListener);
            canvas.removeEventListener('touchend', endDrawing);

            canvas.removeEventListener('pointerdown', handlePointerDown as EventListener);
            canvas.removeEventListener('pointermove', handlePointerMove as EventListener);
            canvas.removeEventListener('pointerup', endDrawing);
        };
    }, [inputDevice, color, lineWidth, eraserWidth, eraseMode]);

    // Custom pointer size based on current stroke/eraser width
    const pointerSize = Math.max((eraseMode ? eraserWidth : lineWidth) * 5, 10);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
            }}
        >
            {/* Controls Panel */}
            <Paper elevation={3} sx={{ padding: 2, margin: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    <Box>
                        {!eraseMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ mr: 1 }}>Color:</Typography>
                                <input type='color' value={color} onChange={(e) => setColor(e.target.value)} style={{ border: 'none', background: 'none' }} />
                            </Box>
                        )}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 1 }}>Mode:</Typography>
                            <Button variant={eraseMode ? 'outlined' : 'contained'} onClick={() => setEraseMode(false)} sx={{ mr: 1 }}>
                                Pen
                            </Button>
                            <Button variant={eraseMode ? 'contained' : 'outlined'} onClick={() => setEraseMode(true)}>
                                Eraser
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!eraseMode ? (
                                <>
                                    <Typography sx={{ mr: 1 }}>Stroke Width:</Typography>
                                    <Slider
                                        value={lineWidth}
                                        onChange={(e, newValue) => setLineWidth(newValue as number)}
                                        step={1}
                                        min={1}
                                        max={50}
                                        sx={{ width: 150 }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Typography sx={{ mr: 1 }}>Eraser Width:</Typography>
                                    <Slider
                                        value={eraserWidth}
                                        onChange={(e, newValue) => setEraserWidth(newValue as number)}
                                        step={1}
                                        min={1}
                                        max={50}
                                        sx={{ width: 150 }}
                                    />
                                </>
                            )}
                        </Box>
                    </Box>
                    {/* <Box item xs={12}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Button variant='contained' onClick={exportCanvas}>
                                Export as Image
                            </Button>
                        </Box>
                    </Box> */}
                </Box>
            </Paper>

            {/* Canvas Container */}
            <Box sx={{ flexGrow: 1, position: 'relative', margin: 2 }}>
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    style={{
                        border: '1px solid #000',
                        touchAction: 'none',
                        cursor: 'none',
                    }}
                />
                {/* Custom pointer overlay */}
                {pointerPos && (
                    <div
                        style={{
                            position: 'absolute',
                            top: pointerPos.y - pointerSize / 2,
                            left: pointerPos.x - pointerSize / 2,
                            width: pointerSize,
                            height: pointerSize,
                            border: `2px solid ${eraseMode ? 'gray' : color}`,
                            borderRadius: '50%',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export default Canvas;
