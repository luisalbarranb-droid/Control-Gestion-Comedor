declare module 'react-qr-scanner' {
    export interface QrReaderProps {
        delay?: number | false;
        onError?: (error: any) => void;
        onScan?: (data: any) => void;
        style?: any;
        facingMode?: 'user' | 'environment';
        legacyMode?: boolean;
        maxImageSize?: number;
        className?: string;
    }
    const QrReader: React.ComponentClass<QrReaderProps>;
    export default QrReader;
}
