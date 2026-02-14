declare module 'react-qr-scanner' {
    export interface QrReaderProps {
        delay?: number | false;
        onError?: (error: any) => void;
        onScan?: (data: any) => void;
        style?: React.CSSProperties;
        facingMode?: 'user' | 'environment';
        constraints?: {
            video: {
                facingMode?: 'user' | 'environment';
                [key: string]: any;
            };
            audio?: boolean;
        };
        legacyMode?: boolean;
        maxImageSize?: number;
        className?: string;
    }
    const QrReader: React.ComponentClass<QrReaderProps>;
    export default QrReader;
}
